---
description: Push updates to GitHub repository
---

# Push Updates to GitHub

Use this workflow to push any changes to the Pro Bono GitHub repository.

## Steps

// turbo-all

1. Stage all changes:
```bash
git add -A
```

2. Check what will be committed:
```bash
git status
```

3. Commit the changes with a descriptive message:
```bash
git commit -m "Update: [describe changes here]"
```

4. Push to the remote repository:
```bash
git push origin main
```

## Quick One-Liner

For quick updates, you can use this combined command:
```bash
git add -A && git commit -m "Update: [description]" && git push origin main
```

## Notes

- Always use descriptive commit messages
- The repository URL is: https://github.com/Hootsworth/pro_bono
- Make sure you have write access to the repository
