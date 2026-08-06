# Project Rules & Customizations

- **Semantic Versioning**: For every update or modification request, increment the project semantic version across configuration files (`package.json`, `backend/app/main.py`), git tags, and release documentation.
- **Graphify Graph**: Update the graphify graph and architectural dependency representations with every update by executing: `graphify extract . --code-only && graphify cluster-only /Users/harshitsuthar/workspace/raghuvirconsultants-site/`
- **Test Case Updates**: For every update in backend, update/add the new test cases make sure to keep coverage around 95% for each files.
 
