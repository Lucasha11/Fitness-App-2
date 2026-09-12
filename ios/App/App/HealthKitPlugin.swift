import Capacitor
import Foundation
import HealthKit

/**
 * Reads movement data out of HealthKit so the app's activity trends reflect
 * what the user actually did, not just the breaks they took inside MoveMate.
 *
 * Read-only by design: nothing here writes to the Health store, so the app
 * needs `NSHealthShareUsageDescription` but not its `Update` counterpart.
 */
@objc(HealthKitPlugin)
public class HealthKitPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "HealthKitPlugin"
    public let jsName = "HealthKit"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "isAvailable", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestAuthorization", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "queryDailyTotals", returnType: CAPPluginReturnPromise)
    ]

    private let healthStore = HKHealthStore()

    /**
     * The metrics the JS layer can ask for, each paired with the unit its
     * values come back in. The JS name is the contract — the HealthKit
     * identifier behind it is an implementation detail.
     */
    private enum Metric: String, CaseIterable {
        case steps
        case distance
        case activeEnergy
        case exerciseMinutes
        case standMinutes
        case flightsClimbed

        var identifier: HKQuantityTypeIdentifier {
            switch self {
            case .steps: return .stepCount
            case .distance: return .distanceWalkingRunning
            case .activeEnergy: return .activeEnergyBurned
            case .exerciseMinutes: return .appleExerciseTime
            case .standMinutes: return .appleStandTime
            case .flightsClimbed: return .flightsClimbed
            }
        }

        var unit: HKUnit {
            switch self {
            case .steps, .flightsClimbed: return .count()
            case .distance: return .meter()
            case .activeEnergy: return .kilocalorie()
            case .exerciseMinutes, .standMinutes: return .minute()
            }
        }

        var quantityType: HKQuantityType? {
            HKQuantityType.quantityType(forIdentifier: identifier)
        }
    }

    // MARK: - Availability

    @objc func isAvailable(_ call: CAPPluginCall) {
        call.resolve(["available": HKHealthStore.isHealthDataAvailable()])
    }

    // MARK: - Authorization

    /**
     * Asks for read access to the requested metrics.
     *
     * HealthKit deliberately never reports whether a *read* was granted — that
     * would leak health information by itself — so `requested` only means the
     * sheet was shown without error. Denial surfaces downstream as a day whose
     * value is `null` rather than `0`.
     */
    @objc func requestAuthorization(_ call: CAPPluginCall) {
        guard HKHealthStore.isHealthDataAvailable() else {
            call.reject("HealthKit is not available on this device")
            return
        }

        let metrics = self.metrics(from: call)
        let types = Set(metrics.compactMap { $0.quantityType as HKObjectType? })

        guard !types.isEmpty else {
            call.reject("No readable metrics were requested")
            return
        }

        healthStore.requestAuthorization(toShare: [], read: types) { _, error in
            if let error {
                call.reject("Authorization failed: \(error.localizedDescription)", nil, error)
                return
            }
            call.resolve(["requested": true])
        }
    }

    // MARK: - Daily totals

    /**
     * One bucket per local day for each requested metric.
     *
     * Buckets are anchored to local midnight so a day means the user's day,
     * and totals come back split by source as well as summed: an iPhone and a
     * Watch both record steps, so a naive sum double-counts. The JS layer
     * decides how to reconcile them — it has the per-source numbers to do it.
     */
    @objc func queryDailyTotals(_ call: CAPPluginCall) {
        guard HKHealthStore.isHealthDataAvailable() else {
            call.reject("HealthKit is not available on this device")
            return
        }

        guard
            let startISO = call.getString("startDate"),
            let endISO = call.getString("endDate"),
            let start = Self.parseDate(startISO),
            let end = Self.parseDate(endISO)
        else {
            call.reject("startDate and endDate must be ISO 8601 strings")
            return
        }

        guard start < end else {
            call.reject("startDate must fall before endDate")
            return
        }

        let metrics = self.metrics(from: call)
        guard !metrics.isEmpty else {
            call.reject("No readable metrics were requested")
            return
        }

        let calendar = Calendar.current
        let anchor = calendar.startOfDay(for: start)
        let group = DispatchGroup()
        let lock = NSLock()

        var buckets: [String: [String: Any]] = [:]
        var failure: String?

        for metric in metrics {
            guard let type = metric.quantityType else { continue }
            group.enter()

            let predicate = HKQuery.predicateForSamples(
                withStart: start,
                end: end,
                options: [.strictStartDate]
            )

            let query = HKStatisticsCollectionQuery(
                quantityType: type,
                quantitySamplePredicate: predicate,
                options: [.cumulativeSum, .separateBySource],
                anchorDate: anchor,
                intervalComponents: DateComponents(day: 1)
            )

            query.initialResultsHandler = { _, collection, error in
                defer { group.leave() }

                if let error {
                    lock.lock()
                    failure = failure ?? "\(metric.rawValue): \(error.localizedDescription)"
                    lock.unlock()
                    return
                }

                guard let collection else { return }

                collection.enumerateStatistics(from: anchor, to: end) { statistics, _ in
                    let day = Self.dayKey(for: statistics.startDate, calendar: calendar)
                    let unit = metric.unit

                    // No samples at all: report absence, not a zero. A denied
                    // read looks exactly like this, and the difference matters
                    // to a trend line.
                    let total = statistics.sumQuantity()?.doubleValue(for: unit)

                    let sources: [[String: Any]] = (statistics.sources ?? []).compactMap { source in
                        guard let value = statistics.sumQuantity(for: source)?.doubleValue(for: unit) else {
                            return nil
                        }
                        return [
                            "bundleId": source.bundleIdentifier,
                            "name": source.name,
                            "value": value
                        ]
                    }

                    lock.lock()
                    var entry = buckets[day] ?? ["date": day, "metrics": [String: Any]()]
                    var metricMap = entry["metrics"] as? [String: Any] ?? [:]
                    metricMap[metric.rawValue] = [
                        "total": total as Any,
                        "sources": sources
                    ]
                    entry["metrics"] = metricMap
                    buckets[day] = entry
                    lock.unlock()
                }
            }

            healthStore.execute(query)
        }

        group.notify(queue: .main) {
            if let failure {
                call.reject("Query failed for \(failure)")
                return
            }

            let days = buckets.values.sorted { left, right in
                (left["date"] as? String ?? "") < (right["date"] as? String ?? "")
            }

            call.resolve(["days": days])
        }
    }

    // MARK: - Helpers

    /** The requested metrics, ignoring names this build doesn't know. */
    private func metrics(from call: CAPPluginCall) -> [Metric] {
        guard let names = call.getArray("metrics", String.self), !names.isEmpty else {
            return Metric.allCases
        }
        return names.compactMap { Metric(rawValue: $0) }
    }

    /** `YYYY-MM-DD` in the device's own timezone, matching the JS `dateKey`. */
    private static func dayKey(for date: Date, calendar: Calendar) -> String {
        let parts = calendar.dateComponents([.year, .month, .day], from: date)
        return String(
            format: "%04d-%02d-%02d",
            parts.year ?? 0,
            parts.month ?? 0,
            parts.day ?? 0
        )
    }

    private static func parseDate(_ value: String) -> Date? {
        let withFraction = ISO8601DateFormatter()
        withFraction.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let date = withFraction.date(from: value) { return date }

        let plain = ISO8601DateFormatter()
        plain.formatOptions = [.withInternetDateTime]
        return plain.date(from: value)
    }
}
