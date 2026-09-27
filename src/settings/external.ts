import { App } from '@capacitor/app';
import { AppLauncher } from '@capacitor/app-launcher';
import { Browser } from '@capacitor/browser';
import { Capacitor, registerPlugin } from '@capacitor/core';

/**
 * The ways Settings leaves the app: a web page, a mail draft, and MoveMate's
 * pages in iOS Settings.
 */

export const isNative = Capacitor.isNativePlatform();

/**
 * Opens a page in an in-app Safari sheet on iOS, so the user is one swipe
 * from MoveMate rather than stranded in Safari. A new tab on the web.
 */
export async function openWebPage(url: string): Promise<void> {
  await Browser.open({ url });
}

/**
 * Hands a `mailto:` link to Mail. Resolves `false` when nothing on the phone
 * can take it, which is common on phones where Mail was deleted and always
 * true in the Simulator.
 */
export async function openMail(href: string): Promise<boolean> {
  if (!isNative) {
    window.location.href = href;
    return true;
  }
  try {
    const { completed } = await AppLauncher.openUrl({ url: href });
    return completed;
  } catch {
    return false;
  }
}

/** Which of MoveMate's pages in iOS Settings to open. */
export type SettingsPage = 'app' | 'notifications';

interface SystemSettingsPlugin {
  open(options: { page: SettingsPage }): Promise<{ opened: boolean }>;
}

/** `SystemSettingsPlugin.swift`; there is no web counterpart. */
const SystemSettings = registerPlugin<SystemSettingsPlugin>('SystemSettings');

/**
 * MoveMate's page in iOS Settings, or its notification switches directly.
 *
 * Both come from Apple's public constants, read natively. Since iOS 18 the
 * app page is not always reached and iOS can stop at the Settings root (it
 * always does in a Simulator whose Settings has not listed the app), which is
 * why the footnote also spells out the path by hand.
 */
export async function openAppSettings(page: SettingsPage = 'app'): Promise<void> {
  if (!isNative) return;
  try {
    await SystemSettings.open({ page });
  } catch {
    // Nothing useful to add: the footnote already gives the path.
  }
}

/** `1.0 (1)` on a phone. The web build has no bundle to read a version from. */
export async function appVersion(): Promise<string> {
  if (!isNative) return 'web preview';
  try {
    const { version, build } = await App.getInfo();
    return `${version} (${build})`;
  } catch {
    return 'unknown version';
  }
}
