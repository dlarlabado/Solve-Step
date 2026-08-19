import React, { useState } from "react";
import { Code, Copy, Check, Terminal, FileCode, CheckCircle2, Download } from "lucide-react";

const KOTLIN_FILES = [
  {
    name: "MainActivity.kt",
    path: "app/src/main/java/com/solvestep/app/MainActivity.kt",
    language: "kotlin",
    code: `package com.solvestep.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import com.solvestep.app.ui.screens.MainAppScreen
import com.solvestep.app.ui.theme.SolveStepTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            SolveStepTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    MainAppScreen()
                }
            }
        }
    }
}`,
  },
  {
    name: "CameraScreen.kt",
    path: "app/src/main/java/com/solvestep/app/ui/screens/CameraScreen.kt",
    language: "kotlin",
    code: `package com.solvestep.app.ui.screens

import android.graphics.Bitmap
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageCapture
import androidx.camera.core.ImageProxy
import androidx.camera.view.CameraController
import androidx.camera.view.LifecycleCameraController
import androidx.camera.view.PreviewView
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.Cameraswitch
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.PhotoLibrary
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat

@Composable
fun CameraScreen(
    onImageCaptured: (Bitmap) -> Unit,
    onOpenScratchpad: () -> Unit,
    onOpenGallery: () -> Unit
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    val controller = remember {
        LifecycleCameraController(context).apply {
            setEnabledUseCases(CameraController.IMAGE_CAPTURE)
            cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA
        }
    }

    Box(modifier = Modifier.fillMaxSize().background(Color.Black)) {
        // CameraX Viewfinder
        AndroidView(
            factory = { ctx ->
                PreviewView(ctx).apply {
                    this.controller = controller
                    controller.bindToLifecycle(lifecycleOwner)
                }
            },
            modifier = Modifier.fillMaxSize()
        )

        // Viewfinder Alignment Box
        Box(
            modifier = Modifier
                .align(Alignment.Center)
                .fillMaxWidth(0.85f)
                .aspectRatio(4f / 3f)
                .border(2.dp, Color(0xFF6366F1), RoundedCornerShape(16.dp))
        )

        // Bottom Capture Bar
        Row(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .padding(bottom = 32.dp, start = 24.dp, end = 24.dp),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = onOpenGallery,
                modifier = Modifier.size(48.dp).background(Color(0xFF1E293B), CircleShape)
            ) {
                Icon(Icons.Default.PhotoLibrary, contentDescription = "Gallery", tint = Color.White)
            }

            // Big Shutter Button
            IconButton(
                onClick = {
                    controller.takePicture(
                        ContextCompat.getMainExecutor(context),
                        object : ImageCapture.OnImageCapturedCallback() {
                            override fun onCaptureSuccess(image: ImageProxy) {
                                val bitmap = image.toBitmap()
                                image.close()
                                onImageCaptured(bitmap)
                            }
                        }
                    )
                },
                modifier = Modifier
                    .size(72.dp)
                    .background(Color.White, CircleShape)
                    .border(4.dp, Color(0xFF6366F1), CircleShape)
            ) {
                Icon(Icons.Default.CameraAlt, contentDescription = "Capture", tint = Color(0xFF4338CA))
            }

            IconButton(
                onClick = onOpenScratchpad,
                modifier = Modifier.size(48.dp).background(Color(0xFF1E293B), CircleShape)
            ) {
                Icon(Icons.Default.Edit, contentDescription = "Scratchpad", tint = Color(0xFF818CF8))
            }
        }
    }
}`,
  },
  {
    name: "SolutionScreen.kt",
    path: "app/src/main/java/com/solvestep/app/ui/screens/SolutionScreen.kt",
    language: "kotlin",
    code: `package com.solvestep.app.ui.screens

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.solvestep.app.data.models.SolutionData
import com.solvestep.app.ui.components.LaTeXMathView

@Composable
fun SolutionScreen(
    solution: SolutionData,
    onPracticeSimilar: () -> Unit,
    onScanNew: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("SolveStep Solution", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onScanNew) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        },
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = onPracticeSimilar,
                containerColor = MaterialTheme.colorScheme.primary,
                contentColor = Color.White
            ) {
                Icon(Icons.Default.Repeat, contentDescription = null)
                Spacer(Modifier.width(8.dp))
                Text("Practice Similar", fontWeight = FontWeight.Bold)
            }
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Problem Overview Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "\${solution.subject} • \${solution.topic}",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary
                        )
                        Spacer(Modifier.height(8.dp))
                        LaTeXMathView(latex = solution.detectedText)
                    }
                }
            }

            // Concepts Breakdown
            item {
                Text(
                    text = "Key Concepts & Theorems",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            items(solution.concepts) { concept ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Text(concept.title, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Text(concept.description, fontSize = 12.sp, color = Color.Gray)
                        Spacer(Modifier.height(6.dp))
                        LaTeXMathView(latex = concept.formulaLatex)
                    }
                }
            }

            // Steps
            item {
                Text(
                    text = "Step-by-Step Breakdown",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            items(solution.steps) { step ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Text("Step \${step.stepNumber}: \${step.title}", fontWeight = FontWeight.SemiBold)
                        Text(step.explanation, fontSize = 13.sp)
                        Spacer(Modifier.height(6.dp))
                        LaTeXMathView(latex = step.mathLatex)
                    }
                }
            }

            // Final Answer
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF064E3B))
                ) {
                    Column(modifier = Modifier.padding(18.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("Final Answer", color = Color(0xFF34D399), fontWeight = FontWeight.Bold)
                        LaTeXMathView(latex = solution.finalAnswer.latex)
                    }
                }
                Spacer(Modifier.height(64.dp))
            }
        }
    }
}`,
  },
  {
    name: "GeminiVisionRepository.kt",
    path: "app/src/main/java/com/solvestep/app/data/GeminiVisionRepository.kt",
    language: "kotlin",
    code: `package com.solvestep.app.data

import android.graphics.Bitmap
import com.google.ai.client.generativeai.GenerativeModel
import com.google.ai.client.generativeai.type.content
import com.google.gson.Gson
import com.solvestep.app.data.models.PracticeProblemData
import com.solvestep.app.data.models.SolutionData
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class GeminiVisionRepository(private val apiKey: String) {

    private val generativeModel = GenerativeModel(
        modelName = "gemini-3.7-flash",
        apiKey = apiKey
    )

    private val gson = Gson()

    suspend fun solveMathImage(bitmap: Bitmap): SolutionData = withContext(Dispatchers.IO) {
        val prompt = """
            You are SolveStep, an expert math and physics solver.
            Transcribe the equation, identify core concepts, and provide step-by-step LaTeX derivations and final answers.
            Respond in valid JSON matching SolutionData schema.
        """.trimIndent()

        val inputContent = content {
            image(bitmap)
            text(prompt)
        }

        val response = generativeModel.generateContent(inputContent)
        val jsonText = response.text?.trim() ?: throw IllegalStateException("Empty response from Gemini")
        gson.fromJson(jsonText, SolutionData::class.java)
    }

    suspend fun generatePracticeSimilar(topic: String, originalProblem: String): PracticeProblemData = withContext(Dispatchers.IO) {
        val prompt = """
            Generate a targeted 'Practice Similar' problem based on topic: $topic and problem: $originalProblem.
            Include hint, steps, and final answer in JSON format.
        """.trimIndent()

        val response = generativeModel.generateContent(prompt)
        val jsonText = response.text?.trim() ?: throw IllegalStateException("Empty response")
        gson.fromJson(jsonText, PracticeProblemData::class.java)
    }
}`,
  },
  {
    name: "build.gradle.kts",
    path: "app/build.gradle.kts",
    language: "kotlin",
    code: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = "com.solvestep.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.solvestep.app"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"
    }

    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.material3)
    
    // CameraX for Snap Viewfinder
    implementation(libs.androidx.camera.core)
    implementation(libs.androidx.camera.camera2)
    implementation(libs.androidx.camera.lifecycle)
    implementation(libs.androidx.camera.view)

    // Google Generative AI (Gemini SDK)
    implementation("com.google.ai.client.generativeai:generativeai:0.9.0")
    implementation("com.google.code.gson:gson:2.10.1")
}`,
  },
];

export const KotlinSourceViewer: React.FC = () => {
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const activeFile = KOTLIN_FILES[activeFileIndex];

  const handleCopy = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText(activeFile.code)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
          // ignore error
        });
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Native Android (Kotlin + Jetpack Compose) Source Code</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Android Studio Ready
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Complete native Kotlin implementation with CameraX, Material 3, and Gemini Vision
            </p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="p-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700/60"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy File</span>
            </>
          )}
        </button>
      </div>

      {/* File Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {KOTLIN_FILES.map((file, idx) => (
          <button
            key={file.name}
            onClick={() => setActiveFileIndex(idx)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeFileIndex === idx
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-slate-950/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/80"
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>{file.name}</span>
          </button>
        ))}
      </div>

      {/* Code Container */}
      <div className="relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
        <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>{activeFile.path}</span>
          <span>{activeFile.language}</span>
        </div>
        <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-96">
          <code>{activeFile.code}</code>
        </pre>
      </div>
    </div>
  );
};
