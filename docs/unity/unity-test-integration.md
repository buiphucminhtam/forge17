# Unity Test Framework - Complete Integration Guide

> Automated testing and CI/CD pipeline for Unity game development with vibe coding workflow.

## Overview

This guide enables a **vibe coding** workflow where you:
1. Write code and tests together
2. Run tests automatically from command line
3. Verify builds in CI/CD
4. Ship production-ready games

```
┌─────────────────────────────────────────────────────────────────┐
│                     VIBE CODING WORKFLOW                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────┐     ┌──────────┐     ┌──────────┐              │
│   │  Write   │ ──► │  Test    │ ──► │  Build   │              │
│   │  Code    │     │  Local   │     │  Verify  │              │
│   └──────────┘     └──────────┘     └──────────┘              │
│        │                  │                 │                   │
│        │            npm test           npm run build            │
│        │                  │                 │                   │
│        └──────────────────┴─────────────────┘                   │
│                            │                                   │
│                            ▼                                   │
│                    ┌──────────────┐                           │
│                    │   Commit &   │                           │
│                    │   Push       │                           │
│                    └──────────────┘                           │
│                            │                                   │
│                            ▼                                   │
│                    ┌──────────────┐                           │
│                    │  CI/CD Auto  │                           │
│                    │  Full Test +  │                           │
│                    │  Build        │                           │
│                    └──────────────┘                           │
│                            │                                   │
│                            ▼                                   │
│                    ┌──────────────┐                           │
│                    │  Ship to     │                           │
│                    │  User!       │                           │
│                    └──────────────┘                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. Unity Test Framework Setup

### 1.1 Install Test Framework Package

```bash
# Via Unity Package Manager
# Window > Package Manager > Unity Registry > Test Framework

# Or via manifest.json
# Add to Packages/manifest.json:
"com.unity.test-framework": "2.0.0-pre.18",
```

### 1.2 Project Structure

```
Assets/
├── Scripts/
│   ├── Game/
│   │   ├── PlayerController.cs
│   │   ├── EnemyAI.cs
│   │   └── CombatSystem.cs
│   └── Tests/
│       ├── EditMode/
│       │   ├── PlayerControllerTests.cs
│       │   └── CombatSystemTests.cs
│       └── PlayMode/
│           ├── GameplayIntegrationTests.cs
│           └── PerformanceTests.cs
├── Prefabs/
├── Scenes/
├── ScriptableObjects/
└── Settings/
```

### 1.3 Assembly Definitions

```json
// Assets/Scripts/Game/Game.asmdef
{
    "name": "Game",
    "rootNamespace": "MyGame",
    "references": [
        "Unity.Services.Core",
        "Game.Interfaces"
    ],
    "includePlatforms": [],
    "excludePlatforms": [],
    "allowUnsafeCode": false
}

// Assets/Scripts/Tests/Tests.asmdef
{
    "name": "Tests",
    "rootNamespace": "MyGame.Tests",
    "references": [
        "Game",
        "UnityEngine.TestRunner",
        "UnityEditor.TestRunner"
    ],
    "includePlatforms": [
        "Editor"
    ],
    "precompiledReferences": [],
    "autoReferenced": true,
    "defineConstraints": []
}
```

---

## 2. Test Writing Guide

### 2.1 Edit Mode Tests (Fast)

For pure C# logic, game systems, and utilities:

```csharp
// Assets/Scripts/Tests/EditMode/DamageCalculatorTests.cs
using NUnit.Framework;
using MyGame.Combat;

namespace MyGame.Tests.EditMode
{
    [TestFixture]
    public class DamageCalculatorTests
    {
        private DamageCalculator _calculator;

        [SetUp]
        public void Setup()
        {
            _calculator = new DamageCalculator();
        }

        [TearDown]
        public void TearDown()
        {
            _calculator = null;
        }

        [Test]
        public void CalculateBaseDamage_ReturnsCorrectValue()
        {
            // Arrange
            float baseDamage = 50f;
            float multiplier = 2f;

            // Act
            float result = _calculator.Calculate(baseDamage, multiplier);

            // Assert
            Assert.AreEqual(100f, result, 0.001f);
        }

        [Test]
        [Category("UnitTests")]
        public void Calculate_WithZeroMultiplier_ReturnsZero()
        {
            float result = _calculator.Calculate(100f, 0f);
            Assert.AreEqual(0f, result);
        }

        [Test]
        [Category("UnitTests")]
        public void CalculateCritical_HitsDoubleDamage()
        {
            float baseDamage = 50f;
            bool isCritical = true;
            
            float result = _calculator.CalculateCritical(baseDamage, isCritical);
            
            Assert.AreEqual(100f, result);
        }

        [Test]
        [Category("UnitTests")]
        [TestCase(10f, 1.5f, 15f)]
        [TestCase(20f, 2f, 40f)]
        [TestCase(0f, 2f, 0f)]
        public void Calculate_VariousInputs_ReturnsExpected(
            float baseDamage, float multiplier, float expected)
        {
            float result = _calculator.Calculate(baseDamage, multiplier);
            Assert.AreEqual(expected, result, 0.001f);
        }

        [Test]
        [Category("UnitTests")]
        public void Calculate_NegativeMultiplier_ThrowsException()
        {
            Assert.Throws<ArgumentException>(() =>
                _calculator.Calculate(100f, -1f));
        }
    }
}
```

### 2.2 Play Mode Tests (Slow but Real)

For gameplay testing with full Unity engine:

```csharp
// Assets/Scripts/Tests/PlayMode/PlayerControllerTests.cs
using NUnit.Framework;
using UnityEngine;
using UnityEngine.TestTools;
using MyGame.Player;
using System.Collections;

namespace MyGame.Tests.PlayMode
{
    [TestFixture]
    [Category("GameplayTests")]
    public class PlayerControllerTests
    {
        private GameObject _playerPrefab;
        private GameObject _playerInstance;

        [OneTimeSetUp]
        public void OneTimeSetup()
        {
            _playerPrefab = Resources.Load<GameObject>("Prefabs/Player");
            Assert.IsNotNull(_playerPrefab, "Player prefab not found");
        }

        [SetUp]
        public void Setup()
        {
            _playerInstance = Object.Instantiate(_playerPrefab);
        }

        [TearDown]
        public void TearDown()
        {
            if (_playerInstance != null)
            {
                Object.Destroy(_playerInstance);
            }
        }

        [UnityTest]
        [Category("GameplayTests")]
        public IEnumerator Move_WithInput_MovesInDirection()
        {
            var controller = _playerInstance.GetComponent<PlayerController>();
            Vector3 startPos = _playerInstance.transform.position;
            
            // Simulate input
            controller.SetInput(Vector3.forward);
            
            yield return new WaitForSeconds(0.5f);
            
            Vector3 moved = _playerInstance.transform.position - startPos;
            Assert.IsTrue(moved.z > 0, "Player should move forward");
        }

        [UnityTest]
        [Category("GameplayTests")]
        public IEnumerator TakeDamage_HealthReduces()
        {
            var health = _playerInstance.GetComponent<PlayerHealth>();
            health.MaxHealth = 100f;
            health.CurrentHealth = 100f;
            
            health.TakeDamage(25f);
            
            yield return null; // Wait one frame
            
            Assert.AreEqual(75f, health.CurrentHealth, 0.1f);
        }

        [UnityTest]
        [Category("GameplayTests")]
        public IEnumerator Die_WhenHealthZero_TriggersDeath()
        {
            var health = _playerInstance.GetComponent<PlayerHealth>();
            health.MaxHealth = 100f;
            health.CurrentHealth = 100f;
            
            health.TakeDamage(100f);
            
            yield return new WaitForSeconds(0.1f);
            
            Assert.IsTrue(health.IsDead);
        }
    }
}
```

### 2.3 Integration Tests

```csharp
// Assets/Scripts/Tests/PlayMode/CombatIntegrationTests.cs
using NUnit.Framework;
using UnityEngine;
using UnityEngine.TestTools;
using MyGame.Combat;
using MyGame.Player;
using System.Collections;

namespace MyGame.Tests.PlayMode
{
    [TestFixture]
    [Category("IntegrationTests")]
    public class CombatIntegrationTests
    {
        private GameObject _player;
        private GameObject _enemy;

        [SetUp]
        public void Setup()
        {
            _player = Object.Instantiate(
                Resources.Load<GameObject>("Prefabs/Player"));
            _enemy = Object.Instantiate(
                Resources.Load<GameObject>("Prefabs/Enemy"));
            
            _player.transform.position = Vector3.zero;
            _enemy.transform.position = Vector3.forward * 2f;
        }

        [TearDown]
        public void TearDown()
        {
            Object.Destroy(_player);
            Object.Destroy(_enemy);
        }

        [UnityTest]
        [Category("IntegrationTests")]
        public IEnumerator PlayerAttacksEnemy_EnemyTakesDamage()
        {
            var playerCombat = _player.GetComponent<PlayerCombat>();
            var enemyHealth = _enemy.GetComponent<EnemyHealth>();
            
            float initialHealth = enemyHealth.CurrentHealth;
            
            playerCombat.Attack(_enemy.transform);
            
            yield return new WaitForSeconds(0.1f);
            
            Assert.Less(enemyHealth.CurrentHealth, initialHealth);
        }

        [UnityTest]
        [Category("IntegrationTests")]
        public IEnumerator EnemyDies_DropsLoot()
        {
            var enemy = _enemy.GetComponent<Enemy>();
            enemy.Health = 1f;
            
            var playerCombat = _player.GetComponent<PlayerCombat>();
            playerCombat.Attack(_enemy.transform);
            
            yield return new WaitForSeconds(0.2f);
            
            var loot = Object.FindObjectOfType<LootDrop>();
            Assert.IsNotNull(loot);
        }
    }
}
```

### 2.4 Performance Tests

```csharp
// Assets/Scripts/Tests/PlayMode/PerformanceTests.cs
using NUnit.Framework;
using UnityEngine;
using UnityEngine.TestTools;
using System.Diagnostics;
using System.Collections;

namespace MyGame.Tests.PlayMode
{
    [TestFixture]
    [Category("PerformanceTests")]
    public class PerformanceTests
    {
        [UnityTest]
        [Category("PerformanceTests")]
        public IEnumerator FPS_Stable60_UnderLoad()
        {
            var sw = Stopwatch.StartNew();
            
            // Simulate game load
            for (int i = 0; i < 100; i++)
            {
                var obj = Object.Instantiate(
                    Resources.Load<GameObject>("Prefabs/Cube"));
                yield return null;
                Object.Destroy(obj);
            }
            
            sw.Stop();
            
            // Verify FPS doesn't drop below 30
            float fps = 1f / (sw.ElapsedMilliseconds / 1000f);
            Assert.Greater(fps, 30f, $"FPS too low: {fps}");
        }

        [UnityTest]
        [Category("PerformanceTests")]
        public IEnumerator Memory_NoLeak_After1000Instantiations()
        {
            long initialMemory = GC.GetTotalMemory(true);
            
            for (int i = 0; i < 1000; i++)
            {
                var obj = Object.Instantiate(
                    Resources.Load<GameObject>("Prefabs/Cube"));
                Object.Destroy(obj);
            }
            
            GC.Collect();
            GC.WaitForPendingFinalizers();
            GC.Collect();
            
            long finalMemory = GC.GetTotalMemory(true);
            long leaked = finalMemory - initialMemory;
            
            // Allow 1MB tolerance
            Assert.Less(leaked, 1024 * 1024, 
                $"Memory leak detected: {leaked / 1024}KB");
        }
    }
}
```

---

## 3. Command Line Test Execution

### 3.1 Basic Commands

```bash
# Run all EditMode tests
Unity.exe -runTests \
    -batchmode \
    -projectPath /path/to/project \
    -testResults ./edit-results.xml \
    -testPlatform editmode

# Run all PlayMode tests
Unity.exe -runTests \
    -batchmode \
    -projectPath /path/to/project \
    -testResults ./play-results.xml \
    -testPlatform playmode

# Run specific test assembly
Unity.exe -runTests \
    -batchmode \
    -projectPath /path/to/project \
    -testResults ./results.xml \
    -assemblyNames "Tests"
```

### 3.2 Filter Tests

```bash
# Run specific test class
Unity.exe -runTests \
    -batchmode \
    -projectPath . \
    -testResults results.xml \
    -testFilter "DamageCalculatorTests"

# Run specific test method
Unity.exe -runTests \
    -batchmode \
    -projectPath . \
    -testResults results.xml \
    -testFilter "DamageCalculatorTests.CalculateBaseDamage_ReturnsCorrectValue"

# Run by category
Unity.exe -runTests \
    -batchmode \
    -projectPath . \
    -testResults results.xml \
    -testCategory "UnitTests"

# Multiple categories (AND)
Unity.exe -runTests \
    -batchmode \
    -projectPath . \
    -testResults results.xml \
    -testCategory "UnitTests;IntegrationTests"
```

### 3.3 Test Runner API (Programmatic)

```csharp
// Assets/Editor/RunTests.cs
using UnityEditor;
using UnityEditor.TestTools.TestRunner.Api;
using UnityEngine;

public class RunTests
{
    [MenuItem("Tools/Run All Tests")]
    public static void RunAllTests()
    {
        var api = ScriptableObject.CreateInstance<TestRunnerApi>();
        
        api.RegisterCallbacks(new TestCallbacks());
        
        api.Execute(new ExecutionSettings(
            new Filter()
            {
                testMode = TestMode.PlayMode
            }
        ));
    }

    [MenuItem("Tools/Run Unit Tests Only")]
    public static void RunUnitTests()
    {
        var api = ScriptableObject.CreateInstance<TestRunnerApi>();
        
        api.Execute(new ExecutionSettings(
            new Filter()
            {
                testMode = TestMode.EditMode,
                categoryNames = new[] { "UnitTests" }
            }
        ));
    }
}

public class TestCallbacks : ICallbacks
{
    public void RunStarted(string suiteName, int totalCount) 
    {
        Debug.Log($"Test run started: {suiteName}, {totalCount} tests");
    }

    public void TestStarted(string testName) 
    {
        Debug.Log($"Starting: {testName}");
    }

    public void TestFinished(ITestResultAdaptor result)
    {
        if (result.TestStatus == TestStatus.Failed)
        {
            Debug.LogError($"FAILED: {result.Test.Name}");
            Debug.LogError(result.Message);
        }
    }

    public void RunFinished(ITestResultAdaptor result)
    {
        Debug.Log($"Run finished: {result.Passed} passed, {result.Failed} failed");
    }
}
```

---

## 4. CI/CD Pipeline Configuration

### 4.1 GitHub Actions

```yaml
# .github/workflows/unity-tests.yml
name: Unity Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    name: Unity Test Runner
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Cache Unity License
        uses: actions/cache@v4
        with:
          path: ~/.local/share/unity3d
          key: unity-license-${{ hashFiles('**/Packages/manifest.json') }}

      - name: Activate Unity
        uses: game-ci/unity-activate@v4
        with:
          unity Licence: ${{ secrets.UNITY_LICENSE }}

      - name: Run EditMode Tests
        uses: game-ci/unity-test-runner@v4
        with:
          projectPath: .
          testMode: EditMode
          artifactsPath: edit-artifacts
          githubToken: ${{ secrets.GITHUB_TOKEN }}

      - name: Run PlayMode Tests
        uses: game-ci/unity-test-runner@v4
        with:
          projectPath: .
          testMode: PlayMode
          artifactsPath: play-artifacts
          githubToken: ${{ secrets.GITHUB_TOKEN }}

      - name: Upload Test Results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results
          path: |
            edit-artifacts/**/*.xml
            play-artifacts/**/*.xml
```

### 4.2 GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build

variables:
  UNITY_IMAGE: unityci/editor:2022.3.40f1

unity-test:
  stage: test
  image: $UNITY_IMAGE
  before_script:
    - unity-editor --quit -batchmode -projectPath . -restoreLicense
  script:
    - unity-editor -runTests -batchmode -projectPath . -testResults edit-results.xml -testPlatform editmode
    - unity-editor -runTests -batchmode -projectPath . -testResults play-results.xml -testPlatform playmode
  artifacts:
    when: always
    paths:
      - "*.xml"
    reports:
      junit: "*.xml"
```

### 4.3 Jenkinsfile

```groovy
// Jenkinsfile
pipeline {
    agent {
        label 'unity'
    }
    
    stages {
        stage('Test') {
            parallel {
                stage('EditMode') {
                    steps {
                        bat '''
                            Unity.exe -runTests -batchmode ^
                                -projectPath . ^
                                -testResults edit-results.xml ^
                                -testPlatform editmode
                        '''
                    }
                    post {
                        always {
                            junit 'edit-results.xml'
                        }
                    }
                }
                
                stage('PlayMode') {
                    steps {
                        bat '''
                            Unity.exe -runTests -batchmode ^
                                -projectPath . ^
                                -testResults play-results.xml ^
                                -testPlatform playmode
                        '''
                    }
                    post {
                        always {
                            junit 'play-results.xml'
                        }
                    }
                }
            }
        }
        
        stage('Build') {
            when {
                branch 'main'
            }
            steps {
                bat '''
                    Unity.exe -batchmode -projectPath . ^
                        -buildTarget Windows ^
                        -buildPath ./Build/Game.exe ^
                        -quit
                '''
            }
            post {
                success {
                    archiveArtifacts 'Build/**/*'
                }
            }
        }
    }
}
```

---

## 5. NPM Scripts for Convenience

### 5.1 package.json

```json
{
  "name": "unity-game-scripts",
  "version": "1.0.0",
  "scripts": {
    "unity:edit-tests": "UNITY_PATH='/Applications/Unity/Unity.app/Contents/MacOS/Unity' && $UNITY_PATH -runTests -batchmode -projectPath . -testResults ./edit-results.xml -testPlatform editmode",
    "unity:play-tests": "UNITY_PATH='/Applications/Unity/Unity.app/Contents/MacOS/Unity' && $UNITY_PATH -runTests -batchmode -projectPath . -testResults ./play-results.xml -testPlatform playmode",
    "unity:test": "npm run unity:edit-tests && npm run unity:play-tests",
    "unity:build:win": "UNITY_PATH='/Applications/Unity/Unity.app/Contents/MacOS/Unity' && $UNITY_PATH -batchmode -projectPath . -buildTarget WindowsStandalone -buildPath ./Build/Game.exe -quit",
    "unity:build:mac": "UNITY_PATH='/Applications/Unity/Unity.app/Contents/MacOS/Unity' && $UNITY_PATH -batchmode -projectPath . -buildTarget MacStandalone -buildPath ./Build/Game.app -quit",
    "unity:build:linux": "UNITY_PATH='/Applications/Unity/Unity.app/Contents/MacOS/Unity' && $UNITY_PATH -batchmode -projectPath . -buildTarget LinuxStandalone -buildPath ./Build/Game.x86_64 -quit",
    "test": "npm run unity:test",
    "build": "npm run unity:build:win"
  }
}
```

### 5.2 Cross-Platform Unity Runner

```bash
#!/bin/bash
# unity-run.sh

UNITY_PATHS=(
    "/Applications/Unity/Unity.app/Contents/MacOS/Unity"
    "/usr/local/unity-editor/Editor/Unity"
    "C:/Program Files/Unity/Editor/Unity.exe"
)

find_unity() {
    for path in "${UNITY_PATHS[@]}"; do
        if [ -f "$path" ]; then
            echo "$path"
            return 0
        fi
    done
    echo "Unity not found" >&2
    return 1
}

UNITY=$(find_unity) || exit 1

case "$1" in
    edit-tests)
        "$UNITY" -runTests -batchmode -projectPath . -testResults ./edit-results.xml -testPlatform editmode
        ;;
    play-tests)
        "$UNITY" -runTests -batchmode -projectPath . -testResults ./play-results.xml -testPlatform playmode
        ;;
    all-tests)
        "$UNITY" -runTests -batchmode -projectPath . -testResults ./edit-results.xml -testPlatform editmode
        "$UNITY" -runTests -batchmode -projectPath . -testResults ./play-results.xml -testPlatform playmode
        ;;
    *)
        echo "Usage: $0 {edit-tests|play-tests|all-tests}"
        exit 1
        ;;
esac
```

---

## 6. Vibe Coding Workflow

### 6.1 Daily Development Loop

```bash
# 1. Start fresh
git pull

# 2. Write feature + tests
# ... write code in Unity ...

# 3. Run tests locally
npm run unity:edit-tests

# 4. If pass, commit
git add -A
git commit -m "feat: add combat system"

# 5. Push
git push

# 6. CI/CD auto-runs full test suite + build
# ... wait for green checkmark ...

# 7. Ship!
```

### 6.2 TDD Flow

```csharp
// Step 1: Write failing test
[Test]
public void TakeDamage_NegativeAmount_ThrowsException()
{
    Assert.Throws<ArgumentException>(() =>
        _health.TakeDamage(-10f));
}

// Step 2: Run test (should fail)
npm run unity:edit-tests

// Step 3: Write minimal code to pass
public void TakeDamage(float amount)
{
    if (amount < 0)
        throw new ArgumentException("Amount cannot be negative");
    
    _health -= amount;
}

// Step 4: Run test (should pass)
npm run unity:edit-tests

// Step 5: Refactor if needed
// ... clean up code ...

// Step 6: All tests pass, commit
```

### 6.3 Pre-Ship Checklist

```bash
# Local
npm run unity:edit-tests      # Fast unit tests
npm run unity:play-tests      # Gameplay tests

# CI/CD
# ✓ All unit tests pass
# ✓ All integration tests pass
# ✓ All gameplay tests pass
# ✓ Performance tests pass
# ✓ Build succeeds

# Ship!
```

---

## 7. Troubleshooting

### Issue: Tests Not Found

```bash
# Solution: Rebuild assemblies
# In Unity: Edit > Rebuild Script Assemblies
# Or delete Temp/Bee folder
```

### Issue: PlayMode Tests Timeout

```bash
# Solution: Increase timeout
Unity.exe -runTests \
    -batchmode \
    -projectPath . \
    -testResults results.xml \
    -testPlatform playmode \
    -playerHeartbeatTimeout 600
```

### Issue: License Error in CI

```bash
# Solution: Use game-ci action or set license manually
# In GitHub Secrets, add UNITY_LICENSE
```

---

## 8. Resources

- [Unity Test Framework Package](https://docs.unity3d.com/Packages/com.unity.test-framework@latest)
- [Game CI Actions](https://github.com/game-ci/unity-actions)
- [NUnit for Unity](https://github.com/nunit/docs/wiki/NUnit-Documentation)
