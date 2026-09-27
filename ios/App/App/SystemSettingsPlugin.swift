import Capacitor
import UIKit

/**
 * Opens MoveMate's pages in iOS Settings through Apple's public constants.
 *
 * A web view can only hand iOS a URL string, and the strings behind these
 * constants are not documented, so the constants are read here rather than
 * copied into JavaScript. The notification page has its own constant since
 * iOS 16, which aims at the switch itself rather than the app's page.
 */
@objc(SystemSettingsPlugin)
public class SystemSettingsPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SystemSettingsPlugin"
    public let jsName = "SystemSettings"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "open", returnType: CAPPluginReturnPromise)
    ]

    @objc func open(_ call: CAPPluginCall) {
        var urlString = UIApplication.openSettingsURLString
        // iOS 15 has only the app page, which holds the notification switch too.
        if call.getString("page") == "notifications", #available(iOS 16.0, *) {
            urlString = UIApplication.openNotificationSettingsURLString
        }

        guard let url = URL(string: urlString) else {
            call.reject("Settings URL unavailable")
            return
        }

        DispatchQueue.main.async {
            UIApplication.shared.open(url) { opened in
                call.resolve(["opened": opened])
            }
        }
    }
}
