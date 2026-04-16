# Unity Test Framework Research - Vibe Coding Workflow

## Research Summary

### Problem Statement
Enable vibe coding 100% workflow for Unity game development with:
- Automated testing (EditMode + PlayMode)
- CI/CD pipeline integration
- Test-driven development (TDD) workflow
- Ship production-ready games

### Findings

#### 1. Unity Test Framework Capabilities

| Feature | Capability |
|---------|------------|
| **Test Types** | EditMode (fast), PlayMode (full engine) |
| **Command Line** | `-runTests -batchmode -testPlatform` |
| **Test Filter** | By name, category, assembly |
| **Result Format** | XML (JUnit compatible) |
| **API** | TestRunnerApi for programmatic control |
| **CI/CD** | game-ci GitHub Actions, Jenkins, GitLab |

#### 2. Key Commands

```bash
# EditMode (fast, no graphics)
Unity.exe -runTests -batchmode -projectPath . -testResults results.xml -testPlatform editmode

# PlayMode (full engine simulation)
Unity.exe -runTests -batchmode -projectPath . -testResults results.xml -testPlatform playmode

# Filter by category
-testCategory "UnitTests" -testCategory "IntegrationTests"
```

#### 3. Test Categories

| Category | Speed | Use Case |
|----------|-------|----------|
| `UnitTests` | ~10ms/test | Pure C# logic |
| `IntegrationTests` | ~100ms/test | Component interaction |
| `GameplayTests` | ~500ms/test | Full gameplay |
| `PerformanceTests` | ~1s+/test | FPS, memory |

#### 4. CI/CD Integration

- **GitHub Actions**: game-ci/unity-test-runner, game-ci/unity-builder
- **GitLab CI**: Unity container + command line
- **Jenkins**: Pipeline with junit reports
- **Local**: Shell script automation

### Solution Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    VIBE CODING WORKFLOW                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────┐     ┌────────────┐     ┌────────────┐     │
│  │   Write    │ ──► │   Test    │ ──► │   Build    │     │
│  │   Code     │     │   Local   │     │   Verify   │     │
│  └────────────┘     └────────────┘     └────────────┘     │
│        │                 │                    │             │
│        │          npm run test          npm run build        │
│        │                 │                    │             │
│        └─────────────────┼────────────────────┘             │
│                          │                                  │
│                          ▼                                  │
│                  ┌──────────────┐                          │
│                  │    Commit    │                          │
│                  │    Push      │                          │
│                  └──────────────┘                          │
│                          │                                  │
│                          ▼                                  │
│                  ┌──────────────┐                          │
│                  │   CI/CD      │                          │
│                  │   Full Test  │                          │
│                  │   + Build    │                          │
│                  └──────────────┘                          │
│                          │                                  │
│                          ▼                                  │
│                  ┌──────────────┐                          │
│                  │    Ship!     │                          │
│                  └──────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

### Deliverables Created

| File | Purpose |
|------|---------|
| `skills/unity-engineer/SKILL.md` | Unity Engineer skill with test integration |
| `docs/unity/unity-test-integration.md` | Complete guide (command line, CI/CD, TDD) |
| `scripts/unity-workflow.sh` | Shell script for local automation |
| `.github/workflows/unity-ci.yml` | GitHub Actions CI/CD pipeline |

### Implementation Checklist

- [x] Research Unity Test Framework
- [x] Document command-line execution
- [x] Create test script templates
- [x] Design CI/CD pipeline
- [x] Create shell automation script
- [x] Add GitHub Actions workflow
- [x] Update Unity Engineer skill

### Next Steps for User

1. **Setup Unity Project**:
   ```bash
   # Install Test Framework via Package Manager
   # Window > Package Manager > Test Framework
   ```

2. **Create First Test**:
   ```csharp
   // Assets/Tests/EditMode/MyFirstTest.cs
   [TestFixture]
   public class MyFirstTest
   {
       [Test]
       public void Example()
       {
           Assert.AreEqual(1, 1);
       }
   }
   ```

3. **Run Tests**:
   ```bash
   ./scripts/unity-workflow.sh edit-tests
   ```

4. **Setup CI/CD**:
   - Add Unity secrets to GitHub
   - Push code
   - Watch tests run automatically

### Resources

- [Unity Test Framework Docs](https://docs.unity3d.com/Packages/com.unity.test-framework@latest)
- [Game CI GitHub Actions](https://github.com/game-ci/unity-actions)
- [Unity Test Framework NPM](https://www.npmjs.com/package/unity-test-framework)
