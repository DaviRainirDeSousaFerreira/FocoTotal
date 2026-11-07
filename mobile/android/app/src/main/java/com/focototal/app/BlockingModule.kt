
package com.focototal.app

import android.content.ComponentName
import android.content.Intent
import android.provider.Settings
import android.text.TextUtils
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray

class BlockingModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "BlockingModule"

    // Recebe do React Native o estado do bloqueio e os aplicativos selecionados.
    @ReactMethod
    fun updateBlockingData(
        shouldBlock: Boolean,
        apps: ReadableArray,
        promise: Promise
    ) {
        try {
            val aplicativos = mutableSetOf<String>()

            for (i in 0 until apps.size()) {
                val pacote = apps.getString(i)
                if (!pacote.isNullOrBlank()) {
                    aplicativos.add(pacote)
                }
            }

            val preferencias = reactApplicationContext
                .getSharedPreferences("FocoTotal", 0)

            preferencias.edit()
                .putBoolean("shouldBlock", shouldBlock)
                .putStringSet("blockedApps", aplicativos)
                .apply()

            promise.resolve(true)
        } catch (erro: Exception) {
            promise.reject("UPDATE_BLOCKING_ERROR", erro)
        }
    }

    // Abre as configurações de acessibilidade do Android.
    @ReactMethod
    fun openAccessibilitySettings(promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }

            reactApplicationContext.startActivity(intent)
            promise.resolve(true)
        } catch (erro: Exception) {
            promise.reject("ACCESSIBILITY_SETTINGS_ERROR", erro)
        }
    }

    // Verifica se o usuário ativou o serviço do FocoTotal.
    @ReactMethod
    fun isAccessibilityServiceEnabled(promise: Promise) {
        try {
            val servico = ComponentName(
                reactApplicationContext,
                BlockingAccessibilityService::class.java
            )

            val servicosAtivos = Settings.Secure.getString(
                reactApplicationContext.contentResolver,
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
            )

            val habilitado = !TextUtils.isEmpty(servicosAtivos) &&
                servicosAtivos.split(":").any {
                    it.equals(servico.flattenToString(), ignoreCase = true)
                }

            promise.resolve(habilitado)
        } catch (erro: Exception) {
            promise.reject("ACCESSIBILITY_CHECK_ERROR", erro)
        }
    }
}
