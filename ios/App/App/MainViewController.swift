import Capacitor
import UIKit

/**
 * Registers MoveMate's own native plugins with the Capacitor bridge.
 *
 * Capacitor auto-discovers plugins that arrive as Swift packages, but classes
 * compiled into the app target itself are invisible to it — the bridge answers
 * calls to them with "plugin is not implemented on ios". Registering them here
 * is the supported way to close that gap, and `capacitorDidLoad` is the one
 * moment the bridge exists but the web view has not yet started calling into
 * it.
 */
class MainViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(HealthKitPlugin())
        bridge?.registerPluginInstance(MotionPlugin())
    }
}
