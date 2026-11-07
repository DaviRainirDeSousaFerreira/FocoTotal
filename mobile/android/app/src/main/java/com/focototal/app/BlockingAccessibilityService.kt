package com.focototal.app

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.util.Log
import android.view.Gravity
import android.view.WindowManager
import android.view.accessibility.AccessibilityEvent
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView

class BlockingAccessibilityService : AccessibilityService() {

    private var janelaBloqueio: LinearLayout? = null
    private lateinit var gerenciadorJanelas: WindowManager

    override fun onServiceConnected() {
        super.onServiceConnected()
        gerenciadorJanelas = getSystemService(WINDOW_SERVICE) as WindowManager
        Log.d("FocoTotalA11y", "Serviço conectado")
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        val pacoteAberto = event?.packageName?.toString() ?: return

        // Ignora eventos do próprio FocoTotal sem remover a sobreposição.
        if (pacoteAberto == packageName) {
            Log.d("FocoTotalA11y", "Evento do próprio FocoTotal ignorado")
            return
        }

        val preferencias = getSharedPreferences("FocoTotal", MODE_PRIVATE)

        val deveBloquear = preferencias.getBoolean("shouldBlock", false)

        val aplicativosBloqueados = preferencias
            .getStringSet("blockedApps", emptySet())
            ?: emptySet()

        if (deveBloquear && pacoteAberto in aplicativosBloqueados) {
            mostrarTelaBloqueio()
        } else {
            removerTelaBloqueio()
        }
    }

    private fun mostrarTelaBloqueio() {
        if (janelaBloqueio != null) return

        Log.d("FocoTotalA11y", "MOSTRANDO TELA DE BLOQUEIO")

        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(48, 48, 48, 48)
            setBackgroundColor(Color.rgb(25, 20, 45))
        }

        val titulo = TextView(this).apply {
            text = "Hora de manter o foco!"
            textSize = 28f
            setTextColor(Color.WHITE)
            gravity = Gravity.CENTER
        }

        val mensagem = TextView(this).apply {
            text = "Você ainda possui tarefas obrigatórias pendentes para hoje."
            textSize = 18f
            setTextColor(Color.LTGRAY)
            gravity = Gravity.CENTER
            setPadding(0, 24, 0, 32)
        }

        val botao = Button(this).apply {
            text = "Abrir FocoTotal"
            setOnClickListener {
                // Remove a sobreposição antes de abrir o aplicativo.
                removerTelaBloqueio()

                val intent = packageManager
                    .getLaunchIntentForPackage(packageName)

                intent?.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)

                if (intent != null) {
                    startActivity(intent)
                }
            }
        }

        layout.addView(titulo)
        layout.addView(mensagem)
        layout.addView(botao)

        val parametros = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY,
            WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.CENTER
        }

        try {
            janelaBloqueio = layout
            gerenciadorJanelas.addView(layout, parametros)
        } catch (erro: Exception) {
            janelaBloqueio = null
            Log.e("FocoTotalA11y", "Erro ao exibir bloqueio", erro)
        }
    }

    private fun removerTelaBloqueio() {
        val janela = janelaBloqueio ?: return

        // Limpa a referência antes de remover a janela.
        janelaBloqueio = null

        Log.d("FocoTotalA11y", "REMOVENDO TELA DE BLOQUEIO")

        try {
            gerenciadorJanelas.removeView(janela)
        } catch (erro: Exception) {
            Log.e("FocoTotalA11y", "Erro ao remover bloqueio", erro)
        }
    }

    override fun onInterrupt() {
        removerTelaBloqueio()
    }

    override fun onDestroy() {
        removerTelaBloqueio()
        super.onDestroy()
    }
}
