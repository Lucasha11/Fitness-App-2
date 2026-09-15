import Capacitor
import CoreMotion
import Foundation

/**
 * Answers one question for the sitting clock: when did the user last get up?
 *
 * Core Motion keeps roughly seven days of activity history on the device, so
 * this reads that log on demand rather than running a background subscription.
 * Nothing here needs the app to have been awake while the user moved.
 */
@objc(MotionPlugin)
public class MotionPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "MotionPlugin"
    public let jsName = "Motion"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "isAvailable", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestAuthorization", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "lastMovedAt", returnType: CAPPluginReturnPromise)
    ]

    private let activityManager = CMMotionActivityManager()

    /** Core Motion keeps about a week; asking for more returns nothing at all. */
    private static let historyLimitDays = 7

    // MARK: - Availability

    @objc func isAvailable(_ call: CAPPluginCall) {
        call.resolve([
            "available": CMMotionActivityManager.isActivityAvailable(),
            "authorized": CMMotionActivityManager.authorizationStatus() == .authorized
        ])
    }

    /**
     * Core Motion has no explicit permission request — the prompt appears the
     * first time a query runs — so this performs a deliberately tiny one and
     * reports what the status became.
     */
    @objc func requestAuthorization(_ call: CAPPluginCall) {
        guard CMMotionActivityManager.isActivityAvailable() else {
            call.resolve(["available": false, "authorized": false])
            return
        }

        let now = Date()
        activityManager.queryActivityStarting(
            from: now.addingTimeInterval(-60),
            to: now,
            to: OperationQueue.main
        ) { _, _ in
            call.resolve([
                "available": true,
                "authorized": CMMotionActivityManager.authorizationStatus() == .authorized
            ])
        }
    }

    // MARK: - The last time the user got up

    /**
     * Walks the activity log backwards for the most recent real movement and
     * resolves the moment it ended — which is the moment the current sitting
     * stretch began.
     *
     * Low-confidence samples are ignored: a phone jostling on a desk reads as
     * walking often enough that trusting them would reset the clock while the
     * user sat perfectly still.
     */
    @objc func lastMovedAt(_ call: CAPPluginCall) {
        guard CMMotionActivityManager.isActivityAvailable() else {
            call.resolve(["available": false, "authorized": false, "movedAt": nil])
            return
        }

        let now = Date()
        let earliest = Calendar.current.date(
            byAdding: .day,
            value: -Self.historyLimitDays,
            to: now
        ) ?? now

        // Never ask beyond what Core Motion retains, or the query comes back
        // empty and a long sit looks like no data at all.
        var from = earliest
        if let sinceISO = call.getString("since"), let since = Self.parseDate(sinceISO) {
            from = max(since, earliest)
        }

        guard from < now else {
            call.resolve(["available": true, "authorized": true, "movedAt": nil])
            return
        }

        activityManager.queryActivityStarting(from: from, to: now, to: OperationQueue.main) {
            activities, error in
            if let error {
                let denied = (error as NSError).code == Int(CMErrorMotionActivityNotAuthorized.rawValue)
                if denied {
                    call.resolve(["available": true, "authorized": false, "movedAt": nil])
                } else {
                    call.reject("Motion query failed: \(error.localizedDescription)", nil, error)
                }
                return
            }

            guard let activities, !activities.isEmpty else {
                call.resolve(["available": true, "authorized": true, "movedAt": nil])
                return
            }

            guard let lastMovingIndex = activities.lastIndex(where: Self.isMovement) else {
                // Seven days of history and nothing but stillness: report no
                // reading rather than inventing one.
                call.resolve(["available": true, "authorized": true, "movedAt": nil])
                return
            }

            // The sitting stretch starts when the movement stopped, which is
            // where the next logged activity begins. Still moving? Then the
            // clock is at zero, so report now.
            let next = activities.index(after: lastMovingIndex)
            let movedAt = next < activities.endIndex ? activities[next].startDate : now

            call.resolve([
                "available": true,
                "authorized": true,
                "movedAt": Self.format(movedAt)
            ])
        }
    }

    // MARK: - Helpers

    /**
     * Movement that should reset the clock. `automotive` is deliberately
     * excluded — sitting in a car is still sitting — and `unknown` carries no
     * signal worth acting on.
     */
    private static func isMovement(_ activity: CMMotionActivity) -> Bool {
        guard activity.confidence != .low else { return false }
        return activity.walking || activity.running || activity.cycling
    }

    private static func format(_ date: Date) -> String {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime]
        return formatter.string(from: date)
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
