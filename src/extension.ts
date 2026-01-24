/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                    KILO CODE - VS CODE EXTENSION ENTRY POINT               ║
 * ║                                                                            ║
 * ║ This file is the main activation point for the Kilo Code VS Code extension║
 * ║ Kilo Code is an AI coding agent that helps developers write code faster   ║
 * ║ and automate tasks using natural language commands.                       ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 1: CORE DEPENDENCIES
// ═══════════════════════════════════════════════════════════════════════════
// These are the fundamental VS Code and Node.js modules needed for extension
// functionality. They provide the base APIs for editor integration.

import * as vscode from "vscode"                    // 🔵 VS Code API - main extension API
import * as dotenvx from "@dotenvx/dotenvx"        // 🟢 Environment variable loader
import * as path from "path"                         // 🟠 Node.js path utilities

// ───────────────────────────────────────────────────────────────────────────
// STEP 1: ENVIRONMENT VARIABLE INITIALIZATION
// ───────────────────────────────────────────────────────────────────────────
// Load environment variables from .env file in the project root. This is done
// early so that later imports can use environment variables if needed.
// Errors are silently handled to prevent extension activation from failing.

try {
	// 📍 Calculate the path to .env file relative to this compiled file location
	// __dirname points to the compiled output directory, so we go up two levels
	// to reach the project root where .env typically resides.
	const envPath = path.join(__dirname, "..", ".env")
	
	// 🔄 Load and parse the .env file, making all variables available via process.env
	dotenvx.config({ path: envPath })
} catch (e) {
	// ⚠️ Log a warning if .env loading fails, but don't crash the extension
	// This is non-fatal because .env may not exist in production environments
	console.warn("Failed to load environment variables:", e)
}


// ═══════════════════════════════════════════════════════════════════════════
// SECTION 2: TYPE DEFINITIONS AND CLOUD SERVICES
// ═══════════════════════════════════════════════════════════════════════════
// Import type definitions and cloud service infrastructure for authentication,
// user management, and cloud synchronization features.

import type { CloudUserInfo, AuthState } from "@roo-code/types"          // 🔷 Type definitions
import { CloudService, BridgeOrchestrator } from "@roo-code/cloud"       // ☁️ Cloud service infrastructure
import { TelemetryService, PostHogTelemetryClient } from "@roo-code/telemetry"  // 📊 Analytics

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 3: UTILITY MODULES AND PATH SETUP
// ═══════════════════════════════════════════════════════════════════════════
// Initialize utility functions and extend built-in types. The path utility
// module adds a toPosix() method to String.prototype for cross-platform paths.

import "./utils/path" // 🛠️ Extends String.prototype with toPosix() for POSIX path conversion

// Import logging utilities for creating output channels and dual-stream loggers
import { createOutputChannelLogger, createDualLogger } from "./utils/outputChannelLogger"

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 4: CORE BUSINESS LOGIC MODULES
// ═══════════════════════════════════════════════════════════════════════════
// Import the main components that drive Kilo Code functionality:
// - Package: Contains version and metadata
// - Language: Internationalization support
// - ContextProxy: Global configuration state management
// - ClineProvider: The main webview provider for the sidebar UI

import { Package } from "./shared/package"                                 // 📦 Extension metadata
import { formatLanguage } from "./shared/language"                         // 🌐 i18n support
import { ContextProxy } from "./core/config/ContextProxy"                  // ⚙️ Config management
import { ClineProvider } from "./core/webview/ClineProvider"              // 🎨 Main UI provider

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 5: EDITOR AND TERMINAL INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════
// Import modules that integrate with VS Code's editor UI and terminal features.
// These handle diff views, terminal command execution, and code navigation.

import { DIFF_VIEW_URI_SCHEME } from "./integrations/editor/DiffViewProvider"  // 📝 Diff view support
import { TerminalRegistry } from "./integrations/terminal/TerminalRegistry"    // 💻 Terminal integration

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 6: BACKGROUND SERVICES AND MANAGERS
// ═══════════════════════════════════════════════════════════════════════════
// These modules provide background functionality like MCP servers (Model Context
// Protocol), code indexing for semantic search, and commit message generation.

import { McpServerManager } from "./services/mcp/McpServerManager"             // 🔌 MCP server orchestration
import { CodeIndexManager } from "./services/code-index/manager"               // 📇 Code indexing & search
import { registerCommitMessageProvider } from "./services/commit-message"      // 💬 Git commit messages
import { MdmService } from "./services/mdm/MdmService"                         // 📱 Device management

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 7: SETTINGS AND CONFIGURATION UTILITIES
// ═══════════════════════════════════════════════════════════════════════════
// Import utilities for managing settings migration, auto-import of configs,
// and initialization of various background tasks.

import { migrateSettings } from "./utils/migrateSettings"                      // ↗️ Settings migration
import { checkAndRunAutoLaunchingTask as checkAndRunAutoLaunchingTask } from "./utils/autoLaunchingTask"  // 🚀 Auto-launch
import { autoImportSettings } from "./utils/autoImportSettings"                // 📥 Auto-import config

// Import the public API that allows other extensions to interact with Kilo Code
import { API } from "./extension/api"

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 8: COMMAND AND REGISTRATION HANDLERS
// ═══════════════════════════════════════════════════════════════════════════
// Import the main activation functions that register all VS Code commands,
// code actions, and other editor features.

import {
	handleUri,                    // 🔗 URI handler for external links
	registerCommands,             // 🎛️ Register all extension commands
	registerCodeActions,          // 💡 Register code action providers
	registerTerminalActions,      // ⌨️ Register terminal actions
	CodeActionProvider,           // 💡 Code action implementation
} from "./activate"

import { initializeI18n } from "./i18n"                                        // 🌍 i18n initialization

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 9: KILOCODE-SPECIFIC FEATURES (Fork-specific enhancements)
// ═══════════════════════════════════════════════════════════════════════════
// These modules are specific to Kilo Code's extensions beyond the Roo codebase.
// They handle ghost code, logging, wrapper detection, API keys, and settings sync.

import { registerGhostProvider } from "./services/ghost" // kilocode_change - Ghost inline code feature
import { registerMainThreadForwardingLogger } from "./utils/fowardingLogger" // kilocode_change - JetBrains logging
import { getKiloCodeWrapperProperties } from "./core/kilocode/wrapper" // kilocode_change - Detect wrapper env
import { checkAnthropicApiKeyConflict } from "./utils/anthropicApiKeyWarning" // kilocode_change - Warn on key conflicts
import { SettingsSyncService } from "./services/settings-sync/SettingsSyncService" // kilocode_change - Settings sync
import { ManagedIndexer } from "./services/code-index/managed/ManagedIndexer" // kilocode_change - Code indexing
import { flushModels, getModels, initializeModelCacheRefresh } from "./api/providers/fetchers/modelCache"  // 🔄 Model cache mgmt
import { kilo_initializeSessionManager } from "./shared/kilocode/cli-sessions/extension/session-manager-utils" // kilocode_change - CLI sessions

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 10: KILOCODE TOKEN DISCOVERY UTILITY FUNCTION
// ═══════════════════════════════════════════════════════════════════════════
// This helper function searches all provider profiles to find a Kilocode token.
// It's used during initialization to set up CLI session management if a token
// is configured in any of the saved provider profiles.

// kilocode_change start - Helper to find Kilocode token across profiles
/**
 * Search through all provider profiles to find a Kilocode authentication token.
 * 
 * This function first checks the current API configuration, and if no token is
 * found there, it iterates through all saved profiles to locate a token.
 * 
 * @param provider - The ClineProvider instance with access to provider settings
 * @returns The Kilocode token if found, otherwise undefined
 */
async function findKilocodeTokenFromAnyProfile(provider: ClineProvider): Promise<string | undefined> {
	// 🔍 Step 1: Check the current/active API configuration first
	const { apiConfiguration } = await provider.getState()
	if (apiConfiguration.kilocodeToken) {
		return apiConfiguration.kilocodeToken
	}

	// 🔍 Step 2: Get a list of all saved provider profiles
	const profiles = await provider.providerSettingsManager.listConfig()

	// 🔍 Step 3: Iterate through each profile looking for a token
	for (const profile of profiles) {
		try {
			// Load the full profile configuration
			const fullProfile = await provider.providerSettingsManager.getProfile({ name: profile.name })
			
			// Check if this profile has a Kilocode token
			if (fullProfile.kilocodeToken) {
				return fullProfile.kilocodeToken
			}
		} catch {
			// ⚠️ Silently skip profiles that fail to load
			continue
		}
	}

	// ❌ No token found in any profile
	return undefined
}
// kilocode_change end

/**
 * Built using https://github.com/microsoft/vscode-webview-ui-toolkit
 *
 * Inspired by:
 *  - https://github.com/microsoft/vscode-webview-ui-toolkit-samples/tree/main/default/weather-webview
 *  - https://github.com/microsoft/vscode-webview-ui-toolkit-samples/tree/main/frameworks/hello-world-react-cra
 */

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 11: GLOBAL STATE VARIABLES
// ═══════════════════════════════════════════════════════════════════════════
// These module-level variables maintain state across the extension's lifecycle.
// They are shared between the activate() and deactivate() functions.

/**
 * 📤 Output channel for logging extension events.
 * Used throughout the extension to display messages to the user in the "Kilo-Code" output panel.
 */
let outputChannel: vscode.OutputChannel

/**
 * 🔧 The extension context provided by VS Code.
 * Contains subscription list, storage APIs, and extension path information.
 */
let extensionContext: vscode.ExtensionContext

/**
 * ☁️ The cloud service instance for authentication and user management.
 * May be undefined in certain environments (e.g., Kilocode CLI wrapper).
 */
let cloudService: CloudService | undefined

/**
 * 🔐 Handler for cloud authentication state changes (login/logout events).
 * Called when the user's auth state transitions between logged-in and logged-out.
 */
let authStateChangedHandler: ((data: { state: AuthState; previousState: AuthState }) => Promise<void>) | undefined

/**
 * ⚙️ Handler for cloud settings updates.
 * Called when cloud-synced settings are modified.
 */
let settingsUpdatedHandler: (() => void) | undefined

/**
 * 👤 Handler for cloud user info updates.
 * Called when the logged-in user's information changes.
 */
let userInfoHandler: ((data: { userInfo: CloudUserInfo }) => Promise<void>) | undefined

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 12: MAIN ACTIVATION FUNCTION
// ═══════════════════════════════════════════════════════════════════════════
// This is the entry point called by VS Code when the extension first activates.
// It initializes all services, sets up event handlers, and registers UI components.

/**
 * 🚀 Extension activation entry point.
 * 
 * This is called by VS Code when:
 * - The user first opens VS Code and the extension is enabled
 * - A command associated with this extension is executed
 * - An event trigger specified in package.json occurs
 * 
 * @param context - VS Code extension context with subscriptions and storage APIs
 * @returns The public API that other extensions can use to interact with Kilo Code
 */
export async function activate(context: vscode.ExtensionContext) {
	// ─────────────────────────────────────────────────────────────────────────
	// STEP 1: INITIALIZE LOGGING INFRASTRUCTURE (📤 Output Channel Setup)
	// ─────────────────────────────────────────────────────────────────────────
	// Create and register the output channel where all extension logs will appear.
	
	extensionContext = context
	outputChannel = vscode.window.createOutputChannel("Kilo-Code")
	context.subscriptions.push(outputChannel)
	outputChannel.appendLine(`${Package.name} extension activated - ${JSON.stringify(Package)}`)
	
	// ─────────────────────────────────────────────────────────────────────────
	// STEP 2: SETTINGS MIGRATION (↗️ Update old configuration format)
	// ─────────────────────────────────────────────────────────────────────────
	// Check if the user has old settings from a previous extension version.
	// If so, migrate them to the new format.
	
	await migrateSettings(context, outputChannel)

	// ─────────────────────────────────────────────────────────────────────────
	// STEP 3: TELEMETRY INITIALIZATION (📊 Analytics Setup)
	// ─────────────────────────────────────────────────────────────────────────
	// Initialize the telemetry service for tracking usage and errors.
	// This helps the development team understand how the extension is being used.
	
	const telemetryService = TelemetryService.createInstance()

	try {
		// Register PostHog as the telemetry backend
		telemetryService.register(new PostHogTelemetryClient())
	} catch (error) {
		console.warn("Failed to register PostHogTelemetryClient:", error.message)
	}

	// ─────────────────────────────────────────────────────────────────────────
	// STEP 4: CLOUD SERVICE LOGGING SETUP (☁️ Create dual logger)
	// ─────────────────────────────────────────────────────────────────────────
	// Create a logger that outputs to both the console and the VS Code output channel.
	// This ensures cloud service messages are visible to users.
	
	const cloudLogger = createDualLogger(createOutputChannelLogger(outputChannel))

	// ─────────────────────────────────────────────────────────────────────────
	// STEP 5: MDM SERVICE INITIALIZATION (📱 Device Management)
	// ─────────────────────────────────────────────────────────────────────────
	// Initialize Mobile Device Management for secure cloud interactions.
	
	const mdmService = await MdmService.createInstance(cloudLogger)

	// ─────────────────────────────────────────────────────────────────────────
	// STEP 6: INTERNATIONALIZATION SETUP (🌍 Language Support)
	// ─────────────────────────────────────────────────────────────────────────
	// Initialize i18n support using the user's VS Code language setting
	// or a previously saved language preference from global state.
	
	initializeI18n(context.globalState.get("language") ?? formatLanguage(vscode.env.language))

	// ─────────────────────────────────────────────────────────────────────────
	// STEP 7: TERMINAL REGISTRY INITIALIZATION (💻 Terminal Execution)
	// ─────────────────────────────────────────────────────────────────────────
	// Initialize the terminal system for executing shell commands.
	// This allows the agent to run commands in the user's terminal.
	
	TerminalRegistry.initialize()

	// ─────────────────────────────────────────────────────────────────────────
	// STEP 8: ALLOWED COMMANDS CONFIGURATION (🛡️ Security Policy)
	// ─────────────────────────────────────────────────────────────────────────
	// Get the list of shell commands that the agent is allowed to execute.
	// This is set by the user in VS Code settings as a security restriction.
	
	const defaultCommands = vscode.workspace.getConfiguration(Package.name).get<string[]>("allowedCommands") || []

	// ─────────────────────────────────────────────────────────────────────────
	// STEP 9: GLOBAL STATE INITIALIZATION (💾 Persistent Storage)
	// ─────────────────────────────────────────────────────────────────────────
	// Initialize the allowed commands in global state if not already set.
	// Global state persists across VS Code sessions.
	
	if (!context.globalState.get("allowedCommands")) {
		context.globalState.update("allowedCommands", defaultCommands)
	}

	// ─────────────────────────────────────────────────────────────────────────
	// STEP 10: CONTEXT PROXY INITIALIZATION (⚙️ Configuration Management)
	// ─────────────────────────────────────────────────────────────────────────
	// Create a singleton instance of ContextProxy that provides access to
	// all configuration settings throughout the extension.
	
	const contextProxy = await ContextProxy.getInstance(context)

	// ─────────────────────────────────────────────────────────────────────────
	// STEP 11: CODE INDEX MANAGER INITIALIZATION (📇 Semantic Search)
	// ─────────────────────────────────────────────────────────────────────────
	// Initialize code indexing for each workspace folder to enable semantic search.
	// This indexes all source files in the workspace for context retrieval.
	
	const codeIndexManagers: CodeIndexManager[] = []

	if (vscode.workspace.workspaceFolders) {
		for (const folder of vscode.workspace.workspaceFolders) {
			// Get or create a code index manager for this workspace folder
			const manager = CodeIndexManager.getInstance(context, folder.uri.fsPath)

			if (manager) {
				codeIndexManagers.push(manager)

				// 🔄 Initialize in background (non-blocking)
				// This allows the extension to activate quickly while indexing happens in the background
				void manager.initialize(contextProxy).catch((error) => {
					const message = error instanceof Error ? error.message : String(error)
					outputChannel.appendLine(
						`[CodeIndexManager] Error during background CodeIndexManager configuration/indexing for ${folder.uri.fsPath}: ${message}`,
					)
				})

				// Register for cleanup on extension deactivation
				context.subscriptions.push(manager)
			}
		}
	}

	// ─────────────────────────────────────────────────────────────────────────
	// STEP 12: MAIN UI PROVIDER INITIALIZATION (🎨 Webview Sidebar)
	// ─────────────────────────────────────────────────────────────────────────
	// Create the main ClineProvider which renders the Kilo Code sidebar panel.
	// This must be created BEFORE the CloudService so auth handlers can access it.
	
	const provider = new ClineProvider(context, outputChannel, "sidebar", contextProxy, mdmService)

	// ─────────────────────────────────────────────────────────────────────────
	// STEP 13: MANAGED CODE INDEXER (kilocode_change: Custom indexing)
	// ─────────────────────────────────────────────────────────────────────────
	// Initialize the managed indexer for Kilocode-specific code indexing features.
	
	const managedIndexer = new ManagedIndexer(contextProxy)
	context.subscriptions.push(managedIndexer)

	// ─────────────────────────────────────────────────────────────────────────
	// STEP 14: CLOUD SERVICE EVENT HANDLERS (☁️ Authentication & Sync Events)
	// ─────────────────────────────────────────────────────────────────────────
	// Define handlers that will be called when cloud authentication or settings change.
	// These are defined before CloudService initialization so they can be registered.
	
	// Helper function to post updated state to the webview UI
	const postStateListener = () => ClineProvider.getVisibleInstance()?.postStateToWebview()

	/**
	 * 🔐 Handler for authentication state changes
	 * Called when user logs in/out or session state changes.
	 * Updates the UI and manages remote control capabilities based on auth state.
	 */
	authStateChangedHandler = async (data: { state: AuthState; previousState: AuthState }) => {
		// Post the new auth state to the webview
		postStateListener()

		// If user logged out, disable remote control
		if (data.state === "logged-out") {
			try {
				await provider.remoteControlEnabled(false)
			} catch (error) {
				cloudLogger(
					`[authStateChangedHandler] remoteControlEnabled(false) failed: ${error instanceof Error ? error.message : String(error)}`,
				)
			}
		}

		// Handle caching of Roo models based on auth state
		const handleRooModelsCache = async () => {
			try {
				// 🔄 Flush and refresh the model cache when auth state changes
				await flushModels("roo", true)

				if (data.state === "active-session") {
					cloudLogger(`[authStateChangedHandler] Refreshed Roo models cache for active session`)
				} else {
					cloudLogger(`[authStateChangedHandler] Flushed Roo models cache on logout`)
				}
			} catch (error) {
				cloudLogger(
					`[authStateChangedHandler] Failed to handle Roo models cache: ${error instanceof Error ? error.message : String(error)}`,
				)
			}
		}

		// Update model cache on login/logout
		if (data.state === "active-session" || data.state === "logged-out") {
			// kilocode_change start: disabled - Roo-specific caching
			// await handleRooModelsCache()
			// // Apply stored provider model to API configuration if present
			// if (data.state === "active-session") {
			// 	try {
			// 		const storedModel = context.globalState.get<string>("roo-provider-model")
			// 		if (storedModel) {
			// 			cloudLogger(`[authStateChangedHandler] Applying stored provider model: ${storedModel}`)
			// 			// Get the current API configuration name
			// 			const currentConfigName =
			// 				provider.contextProxy.getGlobalState("currentApiConfigName") || "default"
			// 			// Update it with the stored model using upsertProviderProfile
			// 			await provider.upsertProviderProfile(currentConfigName, {
			// 				apiProvider: "roo",
			// 				apiModelId: storedModel,
			// 			})
			// 			// Clear the stored model after applying
			// 			await context.globalState.update("roo-provider-model", undefined)
			// 			cloudLogger(`[authStateChangedHandler] Applied and cleared stored provider model`)
			// 		}
			// 	} catch (error) {
			// 		cloudLogger(
			// 			`[authStateChangedHandler] Failed to apply stored provider model: ${error instanceof Error ? error.message : String(error)}`,
			// 		)
			// 	}
			// }
			// kilocode_change end
		}
	}

	/**
	 * ⚙️ Handler for cloud settings updates
	 * Called when cloud-synced settings like task sync are modified.
	 * Updates the provider's remote control status based on new settings.
	 */
	settingsUpdatedHandler = async () => {
		// Get the current user info from the cloud service
		const userInfo = CloudService.instance.getUserInfo()

		// Only update remote control if we have user info and cloud API is available
		if (userInfo && CloudService.instance.cloudAPI) {
			try {
				// Enable/disable remote control based on task sync setting
				provider.remoteControlEnabled(CloudService.instance.isTaskSyncEnabled())
			} catch (error) {
				cloudLogger(
					`[settingsUpdatedHandler] remoteControlEnabled failed: ${error instanceof Error ? error.message : String(error)}`,
				)
			}
		}

		// Post updated state to the webview UI
		postStateListener()
	}

	/**
	 * 👤 Handler for user info updates
	 * Called when the logged-in user's profile information changes.
	 * Updates remote control status and posts state changes to the UI.
	 */
	userInfoHandler = async ({ userInfo }: { userInfo: CloudUserInfo }) => {
		// Post updated user info to the webview
		postStateListener()

		// Check if CloudAPI is properly initialized
		if (!CloudService.instance.cloudAPI) {
			cloudLogger("[userInfoHandler] CloudAPI is not initialized")
			return
		}

		try {
			// Update remote control based on task sync settings for this user
			provider.remoteControlEnabled(CloudService.instance.isTaskSyncEnabled())
		} catch (error) {
			cloudLogger(
				`[userInfoHandler] remoteControlEnabled failed: ${error instanceof Error ? error.message : String(error)}`,
			)
		}
	}

	// ─────────────────────────────────────────────────────────────────────────
	// STEP 15: CLOUD SERVICE CREATION (☁️ Initialize cloud infrastructure)
	// ─────────────────────────────────────────────────────────────────────────
	// Create the CloudService instance with all the event handlers defined above.
	// This service handles authentication, user management, and cloud sync.
	
	cloudService = await CloudService.createInstance(context, cloudLogger, {
		"auth-state-changed": authStateChangedHandler,
		"settings-updated": settingsUpdatedHandler,
		"user-info": userInfoHandler,
	})

	try {
		if (cloudService.telemetryClient) {
			// 📊 Register cloud telemetry client (disabled for Kilocode)
			// TelemetryService.instance.register(cloudService.telemetryClient) kilocode_change
		}
	} catch (error) {
		outputChannel.appendLine(
			`[CloudService] Failed to register TelemetryClient: ${error instanceof Error ? error.message : String(error)}`,
		)
	}

	// Register cloud service for cleanup on extension deactivation
	context.subscriptions.push(cloudService)

	// ─────────────────────────────────────────────────────────────────────────
	// STEP 16: CLOUD PROFILE SYNC INITIALIZATION (☁️ Sync provider configs)
	// ─────────────────────────────────────────────────────────────────────────
	// Trigger initial synchronization of cloud profiles now that CloudService is ready.
	// This ensures local provider settings are synced with the cloud.
	
	try {
		await provider.initializeCloudProfileSyncWhenReady()
	} catch (error) {
		outputChannel.appendLine(
			`[CloudService] Failed to initialize cloud profile sync: ${error instanceof Error ? error.message : String(error)}`,
		)
	}

	// ─────────────────────────────────────────────────────────────────────────
	// STEP 17: KILOCODE SESSION MANAGER (kilocode_change: CLI sessions)
	// ─────────────────────────────────────────────────────────────────────────
	// Initialize session management for Kilocode CLI integration.
	// This finds any stored Kilocode token and sets up CLI session handling.
	
	// kilocode_change start
	try {
		// 🔍 Search all provider profiles for a Kilocode token
		const kiloToken = await findKilocodeTokenFromAnyProfile(provider)

		// 🚀 Initialize the session manager with the found token
		await kilo_initializeSessionManager({
			context: context,
			kiloToken,
			log: provider.log.bind(provider),
			outputChannel,
			provider,
		})
	} catch (error) {
		outputChannel.appendLine(
			`[SessionManager] Failed to initialize SessionManager: ${error instanceof Error ? error.message : String(error)}`,
		)
	}
	// kilocode_change end

	// ─────────────────────────────────────────────────────────────────────────
	// STEP 18: TELEMETRY PROVIDER REGISTRATION (📊 Connect provider to telemetry)
	// ─────────────────────────────────────────────────────────────────────────
	// Connect the provider instance to the telemetry service so usage is tracked.
	
	TelemetryService.instance.setProvider(provider)

	// ─────────────────────────────────────────────────────────────────────────
	// STEP 19: WEBVIEW PANEL REGISTRATION (🎨 Register sidebar provider)
	// ─────────────────────────────────────────────────────────────────────────
	// Register the ClineProvider as the handler for the Kilo Code sidebar view.
	// The retainContextWhenHidden option prevents the webview from reloading
	// when the user switches to another sidebar panel.
	
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(ClineProvider.sideBarId, provider, {
			webviewOptions: { retainContextWhenHidden: true },
		}),
	)

	// kilocode_change start
	// ─────────────────────────────────────────────────────────────────────────
	// STEP 20: FIRST INSTALLATION SETUP (🎉 New user welcome experience)
	// ─────────────────────────────────────────────────────────────────────────
	// On first install, show the user the welcome walkthrough and configure
	// default settings for inline code generation (ghost service).
	
	if (!context.globalState.get("firstInstallCompleted")) {
		// Log to the output channel that first installation is detected
		outputChannel.appendLine("First installation detected, opening Kilo Code sidebar!")
		try {
			// 🎯 Focus the Kilo Code sidebar so the user sees the UI
			await vscode.commands.executeCommand("kilo-code.SidebarProvider.focus")

			outputChannel.appendLine("Opening Kilo Code walkthrough")

			// 📖 Show the interactive walkthrough (may fail in some environments - see linked issue)
			await vscode.commands.executeCommand(
				"workbench.action.openWalkthrough",
				"kilocode.kilo-code#kiloCodeWalkthrough",
				false,
			)

			// ⚡ Enable autocomplete by default for new installs, but not for JetBrains IDEs
			// JetBrains users can manually enable it if they want to test the feature
			const { kiloCodeWrapperJetbrains } = getKiloCodeWrapperProperties()
			const currentGhostSettings = contextProxy.getValue("ghostServiceSettings")
			await contextProxy.setValue("ghostServiceSettings", {
				...currentGhostSettings,
				enableAutoTrigger: !kiloCodeWrapperJetbrains,  // ✅ Enable for VSCode, ❌ Disable for JetBrains
				enableSmartInlineTaskKeybinding: true,
			})
		} catch (error) {
			outputChannel.appendLine(`Error during first-time setup: ${error.message}`)
		} finally {
			// Mark that first installation setup has been completed
			await context.globalState.update("firstInstallCompleted", true)
		}
	}
	// kilocode_change end

	// ─────────────────────────────────────────────────────────────────────────
	// STEP 21: AUTO-IMPORT CONFIGURATION (📥 Load user's saved settings)
	// ─────────────────────────────────────────────────────────────────────────
	// If the user has specified a settings file to auto-import, load it now.
	// This allows users to share their configuration across machines.
	
	try {
		await autoImportSettings(outputChannel, {
			providerSettingsManager: provider.providerSettingsManager,
			contextProxy: provider.contextProxy,
			customModesManager: provider.customModesManager,
		})
	} catch (error) {
		outputChannel.appendLine(
			`[AutoImport] Error during auto-import: ${error instanceof Error ? error.message : String(error)}`,
		)
	}

	// kilocode_change start
	// ─────────────────────────────────────────────────────────────────────────
	// STEP 22: ANTHROPIC API KEY CONFLICT CHECK (🔑 Environment variable validation)
	// ─────────────────────────────────────────────────────────────────────────
	// Check for conflicting Anthropic API key settings that might confuse users.
	// Warn if environment variables conflict with extension settings.
	
	try {
		checkAnthropicApiKeyConflict()
	} catch (error) {
		outputChannel.appendLine(`Failed to check API key conflicts: ${error}`)
	}

	// ─────────────────────────────────────────────────────────────────────────
	// STEP 23: VS CODE SETTINGS SYNC INITIALIZATION (🔄 Settings synchronization)
	// ─────────────────────────────────────────────────────────────────────────
	// Initialize integration with VS Code's built-in settings sync feature.
	// This allows Kilo Code settings to sync across devices when enabled.
	
	try {
		// Initialize the settings sync service
		await SettingsSyncService.initialize(context, outputChannel)
		outputChannel.appendLine("[SettingsSync] VS Code Settings Sync integration initialized")

		// Listen for configuration changes to update sync registration
		const configChangeListener = vscode.workspace.onDidChangeConfiguration(async (event) => {
			// Check if the user toggled the settings sync setting
			if (event.affectsConfiguration(`${Package.name}.enableSettingsSync`)) {
				try {
					// Update sync registration based on new setting
					await SettingsSyncService.updateSyncRegistration(context, outputChannel)
					outputChannel.appendLine("[SettingsSync] Sync registration updated due to configuration change")
				} catch (error) {
					outputChannel.appendLine(
						`[SettingsSync] Error updating sync registration: ${error instanceof Error ? error.message : String(error)}`,
					)
				}
			}
		})
		// Register the listener for cleanup on deactivation
		context.subscriptions.push(configChangeListener)
	} catch (error) {
		outputChannel.appendLine(
			`[SettingsSync] Error during settings sync initialization: ${error instanceof Error ? error.message : String(error)}`,
		)
	}
	// kilocode_change end

	// ─────────────────────────────────────────────────────────────────────────
	// STEP 24: COMMAND REGISTRATION (🎛️ Register all extension commands)
	// ─────────────────────────────────────────────────────────────────────────
	// Register all the VS Code commands that this extension provides.
	// Commands like "ask", "edit", and various configuration actions.
	
	registerCommands({ context, outputChannel, provider })

	// ─────────────────────────────────────────────────────────────────────────
	// STEP 25: TEXT DOCUMENT CONTENT PROVIDER (📝 Virtual document support)
	// ─────────────────────────────────────────────────────────────────────────
	// Register a content provider for virtual documents used in diff views.
	// This allows displaying read-only original versions of files for comparison.
	//
	// Reference: https://code.visualstudio.com/api/extension-guides/virtual-documents

	/**
	 * 📄 Text document content provider for diff view left side
	 * 
	 * We use the text document content provider API to show the left side for diff
	 * view by creating a virtual document for the original content. This makes it
	 * readonly so users know to edit the right side if they want to keep their changes.
	 *
	 * This API allows you to create readonly documents in VSCode from arbitrary
	 * sources, and works by claiming an uri-scheme for which your provider then
	 * returns text contents. The scheme must be provided when registering a
	 * provider and cannot change afterwards.
	 */
	const diffContentProvider = new (class implements vscode.TextDocumentContentProvider {
		/**
		 * 📍 Provide text content for a virtual diff document
		 * 
		 * The content is base64-encoded in the URI query string to preserve
		 * special characters and handle large files.
		 * 
		 * @param uri - The virtual document URI containing base64-encoded content in the query
		 * @returns The decoded text content to display in the virtual document
		 */
		provideTextDocumentContent(uri: vscode.Uri): string {
			// 🔓 Decode base64 content from URI query parameter
			return Buffer.from(uri.query, "base64").toString("utf-8")
		}
	})()

	// Register the diff content provider for the custom URI scheme
	context.subscriptions.push(
		vscode.workspace.registerTextDocumentContentProvider(DIFF_VIEW_URI_SCHEME, diffContentProvider),
	)

	// ─────────────────────────────────────────────────────────────────────────
	// STEP 26: URI HANDLER REGISTRATION (🔗 Handle external links)
	// ─────────────────────────────────────────────────────────────────────────
	// Register a handler for custom URIs that can be used to trigger actions
	// from external sources (e.g., website links, CLI tools).
	
	context.subscriptions.push(vscode.window.registerUriHandler({ handleUri }))

	// ─────────────────────────────────────────────────────────────────────────
	// STEP 27: CODE ACTIONS PROVIDER REGISTRATION (💡 Quick fixes & refactorings)
	// ─────────────────────────────────────────────────────────────────────────
	// Register the code actions provider that shows quick fix suggestions
	// and refactoring options in the editor.
	
	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider({ pattern: "**/*" }, new CodeActionProvider(), {
			providedCodeActionKinds: CodeActionProvider.providedCodeActionKinds,
		}),
	)

	// ─────────────────────────────────────────────────────────────────────────
	// STEP 28: KILOCODE-SPECIFIC PROVIDER REGISTRATION (kilocode_change)
	// ─────────────────────────────────────────────────────────────────────────
	// Register Kilo Code-specific providers and features:
	// - Ghost code inline generation (if not in CLI mode)
	// - Forwarding logger for JetBrains IDEs
	// - Commit message generation
	
	// kilocode_change start - Kilo Code specific registrations
	const { kiloCodeWrapped, kiloCodeWrapperCode } = getKiloCodeWrapperProperties()
	if (kiloCodeWrapped) {
		// 🔗 Only forward logs in JetBrains IDEs
		// This sends logs to the JetBrains host process for display in the IDE
		registerMainThreadForwardingLogger(context)
	}
	
	// Don't register the ghost provider for the CLI
	if (kiloCodeWrapperCode !== "cli") {
		// 👻 Register the ghost service for inline code generation
		registerGhostProvider(context, provider)
	}
	
	// 💬 Register commit message generation from git diffs
	registerCommitMessageProvider(context, outputChannel) // kilocode_change
	// kilocode_change end - Kilo Code specific registrations

	// ─────────────────────────────────────────────────────────────────────────
	// STEP 29: GENERAL CODE ACTIONS AND TERMINAL ACTIONS (🎯 More providers)
	// ─────────────────────────────────────────────────────────────────────────
	// Register additional code action handlers and terminal action handlers.
	
	registerCodeActions(context)
	registerTerminalActions(context)

	// ─────────────────────────────────────────────────────────────────────────
	// STEP 30: EXTENSION ACTIVATION NOTIFICATION (✅ Ready to use)
	// ─────────────────────────────────────────────────────────────────────────
	// Signal to other extensions that Kilo Code has finished activating.
	// Other extensions can listen for this command to know when we're ready.
	
	vscode.commands.executeCommand(`${Package.name}.activationCompleted`)

	// ─────────────────────────────────────────────────────────────────────────
	// STEP 31: IPC SOCKET PATH SETUP (🔌 Inter-process communication)
	// ─────────────────────────────────────────────────────────────────────────
	// Get the IPC socket path from environment variables.
	// This is used for CLI/external tool communication with the extension.
	
	const socketPath = process.env.KILO_IPC_SOCKET_PATH ?? process.env.ROO_CODE_IPC_SOCKET_PATH // kilocode_change
	const enableLogging = typeof socketPath === "string"

	// ─────────────────────────────────────────────────────────────────────────
	// STEP 32: DEVELOPMENT MODE FILE WATCHER (🔄 Auto-reload on changes)
	// ─────────────────────────────────────────────────────────────────────────
	// In development mode, watch core files and auto-reload the extension
	// when they change. This speeds up the development cycle.
	
	if (process.env.NODE_ENV === "development") {
		// 👁️ List of paths to watch for changes
		const watchPaths = [
			{ path: context.extensionPath, pattern: "**/*.ts" },
			{ path: path.join(context.extensionPath, "../packages/types"), pattern: "**/*.ts" },
			{ path: path.join(context.extensionPath, "../packages/telemetry"), pattern: "**/*.ts" },
			{ path: path.join(context.extensionPath, "node_modules/@roo-code/cloud"), pattern: "**/*" },
		]

		console.log(
			`♻️♻️♻️ Core auto-reloading: Watching for changes in ${watchPaths.map(({ path }) => path).join(", ")}`,
		)

		// ⏱️ Debounce reload requests to prevent excessive reloads
		let reloadTimeout: NodeJS.Timeout | undefined
		const DEBOUNCE_DELAY = 1_000

		/**
		 * 🔄 Debounced reload function
		 * Groups rapid file changes into a single reload to avoid overwhelming the system.
		 */
		const debouncedReload = (uri: vscode.Uri) => {
			if (reloadTimeout) {
				clearTimeout(reloadTimeout)
			}

			console.log(`♻️ ${uri.fsPath} changed; scheduling reload...`)

			reloadTimeout = setTimeout(() => {
				console.log(`♻️ Reloading host after debounce delay...`)
				// Trigger extension host reload
				vscode.commands.executeCommand("workbench.action.reloadWindow")
			}, DEBOUNCE_DELAY)
		}

		// Watch each path for file changes
		watchPaths.forEach(({ path: watchPath, pattern }) => {
			// Create a relative file pattern for the watcher
			const relPattern = new vscode.RelativePattern(vscode.Uri.file(watchPath), pattern)
			const watcher = vscode.workspace.createFileSystemWatcher(relPattern, false, false, false)

			// Listen to all change types to ensure symlinked file updates trigger reloads
			watcher.onDidChange(debouncedReload)
			watcher.onDidCreate(debouncedReload)
			watcher.onDidDelete(debouncedReload)

			// Register watcher for cleanup
			context.subscriptions.push(watcher)
		})

		// Clean up the debounce timeout on deactivation
		context.subscriptions.push({
			dispose: () => {
				if (reloadTimeout) {
					clearTimeout(reloadTimeout)
				}
			},
		})
	}

	// kilocode_change start: Start ManagedIndexer and run auto-launching tasks
	// ─────────────────────────────────────────────────────────────────────────
	// STEP 33: START MANAGED INDEXER (📇 Begin background code indexing)
	// ─────────────────────────────────────────────────────────────────────────
	// Start the managed indexer in the background. This doesn't block activation.
	
	void managedIndexer.start().catch((error) => {
		outputChannel.appendLine(
			`Failed to start ManagedIndexer: ${error instanceof Error ? error.message : String(error)}`,
		)
	})
	
	// ─────────────────────────────────────────────────────────────────────────
	// STEP 34: CHECK AND RUN AUTO-LAUNCHING TASKS (🚀 Auto-start configured tasks)
	// ─────────────────────────────────────────────────────────────────────────
	// Check if there are any configured tasks that should auto-launch on startup.
	
	await checkAndRunAutoLaunchingTask(context)
	// kilocode_change end

	// ─────────────────────────────────────────────────────────────────────────
	// STEP 35: INITIALIZE MODEL CACHE REFRESH (🔄 Keep models up to date)
	// ─────────────────────────────────────────────────────────────────────────
	// Start background refresh of model lists from AI providers.
	// This ensures the latest available models are always available to users.
	
	initializeModelCacheRefresh()

	// ─────────────────────────────────────────────────────────────────────────
	// STEP 36: RETURN PUBLIC API (🔌 Extension activation complete)
	// ─────────────────────────────────────────────────────────────────────────
	// Return the public API interface that other extensions can use to interact
	// with Kilo Code. This is the final step of activation.
	
	return new API(outputChannel, provider, socketPath, enableLogging)
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 37: EXTENSION DEACTIVATION
// ═══════════════════════════════════════════════════════════════════════════
// This function is called by VS Code when the extension is being deactivated.
// It's responsible for cleaning up resources, closing connections, and
// persisting state to ensure a clean shutdown.

/**
 * 🛑 Extension deactivation cleanup
 * 
 * Called by VS Code when:
 * - The user disables the extension
 * - The user uninstalls the extension
 * - VS Code is closing
 * - The extension is being reloaded
 * 
 * This function is critical for proper resource cleanup.
 */
export async function deactivate() {
	// ─────────────────────────────────────────────────────────────────────────
	// STEP 1: LOG DEACTIVATION (📤 Final log message)
	// ─────────────────────────────────────────────────────────────────────────
	
	outputChannel.appendLine(`${Package.name} extension deactivated`)

	// ─────────────────────────────────────────────────────────────────────────
	// STEP 2: CLOUD SERVICE CLEANUP (☁️ Unregister event handlers)
	// ─────────────────────────────────────────────────────────────────────────
	// Unregister all cloud service event handlers that were attached during
	// activation. This prevents memory leaks and duplicate handler calls.
	
	if (cloudService && CloudService.hasInstance()) {
		try {
			// 🔓 Unregister authentication state change handler
			if (authStateChangedHandler) {
				CloudService.instance.off("auth-state-changed", authStateChangedHandler)
			}

			// ⚙️ Unregister settings update handler
			if (settingsUpdatedHandler) {
				CloudService.instance.off("settings-updated", settingsUpdatedHandler)
			}

			// 👤 Unregister user info update handler
			if (userInfoHandler) {
				CloudService.instance.off("user-info", userInfoHandler as any)
			}

			outputChannel.appendLine("CloudService event handlers cleaned up")
		} catch (error) {
			outputChannel.appendLine(
				`Failed to clean up CloudService event handlers: ${error instanceof Error ? error.message : String(error)}`,
			)
		}
	}

	// ─────────────────────────────────────────────────────────────────────────
	// STEP 3: BRIDGE ORCHESTRATOR DISCONNECT (🔌 Close IPC connection)
	// ─────────────────────────────────────────────────────────────────────────
	// Disconnect from the BridgeOrchestrator if it exists.
	// This closes any active IPC communication with CLI or other external tools.
	
	const bridge = BridgeOrchestrator.getInstance()

	if (bridge) {
		await bridge.disconnect()
	}

	// ─────────────────────────────────────────────────────────────────────────
	// STEP 4: MCP SERVER CLEANUP (🔌 Shutdown Model Context Protocol servers)
	// ─────────────────────────────────────────────────────────────────────────
	// Stop and cleanup all MCP servers that were started during activation.
	// This includes custom MCP servers and their child processes.
	
	await McpServerManager.cleanup(extensionContext)

	// ─────────────────────────────────────────────────────────────────────────
	// STEP 5: TELEMETRY SHUTDOWN (📊 Flush analytics data)
	// ─────────────────────────────────────────────────────────────────────────
	// Shutdown the telemetry service to flush any pending analytics events
	// before the extension stops.
	
	TelemetryService.instance.shutdown()

	// ─────────────────────────────────────────────────────────────────────────
	// STEP 6: TERMINAL REGISTRY CLEANUP (💻 Close open terminals)
	// ─────────────────────────────────────────────────────────────────────────
	// Cleanup any open terminals and reset the terminal registry.
	
	TerminalRegistry.cleanup()
}
