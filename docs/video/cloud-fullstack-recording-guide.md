# Recording Guide — Cloud FullStack Capstone Video

## Before you record

1. Start Spring Boot: `cd backend && JAVA_HOME=/opt/homebrew/opt/openjdk@21 mvn spring-boot:run`
2. Start Next.js: `npm run dev` (port 3000, already running)
3. Open browser tabs:
   - `http://localhost:8080/swagger-ui.html`
   - `https://github.com/alsacia-dragnea/Applied-AI-Specialist-Experience-Front-End-Reskill-Foundation-/pulls`
   - IBM Bob chat with the master prompt visible
   - VS Code with `backend/` folder open
4. Open a terminal in `chapter-and-co/backend/`

---

## Clips to record

| # | Duration | What to show | URL / Action |
|---|----------|-------------|--------------|
| 1 | 0:25 | Slide or spoken intro — project objective | Title card |
| 2 | 0:30 | Architecture diagram or README structure section | VS Code → `backend/README.md` |
| 3 | 0:25 | IBM Bob chat — show master prompt, generated file list | IBM Bob window |
| 4 | 0:20 | VS Code file tree — `backend/src/main/java/` | VS Code Explorer |
| 5 | 0:20 | Swagger UI — full endpoint list | `http://localhost:8080/swagger-ui.html` |
| 6 | 0:20 | Swagger UI — GET /api/v1/books Try it out → Execute | Same tab |
| 7 | 0:15 | Swagger UI — POST /api/v1/auth/login → copy JWT token | Same tab |
| 8 | 0:15 | Swagger UI — GET /api/v1/orders with/without token (401 demo) | Same tab |
| 9 | 0:25 | Terminal — `mvn test` running, scrolling output | Terminal |
| 10 | 0:10 | Terminal — final line: `Tests run: 40, Failures: 0, BUILD SUCCESS` | Terminal |
| 11 | 0:20 | GitHub — PR page, file diff, commit message | GitHub browser tab |

---

## Assemble with FFmpeg

```bash
# List your clips in order in a text file
cat > clips.txt << 'EOF'
file 'clip1.mp4'
file 'clip2.mp4'
file 'clip3.mp4'
file 'clip4.mp4'
file 'clip5.mp4'
file 'clip6.mp4'
file 'clip7.mp4'
file 'clip8.mp4'
file 'clip9.mp4'
file 'clip10.mp4'
file 'clip11.mp4'
EOF

# Concatenate
ffmpeg -f concat -safe 0 -i clips.txt -c copy cloud-fullstack-capstone.mp4

# Burn in captions (optional)
ffmpeg -i cloud-fullstack-capstone.mp4 \
  -vf "subtitles=docs/video/cloud-fullstack-captions.srt" \
  cloud-fullstack-capstone-captioned.mp4
```

---

## Key moments to highlight

- **IBM Bob prompt visible on screen** — the capstone assesses AI tool usage
- **40/40 tests passing** — show the terminal, not just a screenshot
- **Swagger UI live call** — proves the API is running against real data
- **GitHub PR** — show the branch is separate from the FE capstone branch
