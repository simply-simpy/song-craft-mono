#!/usr/bin/env bash
# validate-flows.sh — validate naming & pairing of flow ↔ db-effects docs
set -euo pipefail

ROOT="$(pwd)"
echo "Validating under: $ROOT"

flows=()
while IFS= read -r f; do
  flows+=("$f")
done < <(find . -type f -name "*-flow.mermaid" | sort)

missing_pairs=()
orphan_effects=()
bad_mermaid_names=()

# For each flow, ensure a sibling -db-effects.md exists
for f in "${flows[@]}"; do
  base="${f%-flow.mermaid}"
  effects="${base}-db-effects.md"
  if [[ ! -f "$effects" ]]; then
    missing_pairs+=("$f  ->  MISSING  ${effects}")
  fi
done

effects=()
while IFS= read -r e; do
  effects+=("$e")
done < <(find . -type f -name "*-db-effects.md" | sort)

# Any db-effects without a matching flow?
for e in "${effects[@]}"; do
  base="${e%-db-effects.md}"
  flow="${base}-flow.mermaid"
  if [[ ! -f "$flow" ]]; then
    orphan_effects+=("$e  ->  NO MATCHING FLOW  ${flow}")
  fi
done

# Naming check: any .mermaid not ending in allowed suffixes?
while IFS= read -r m; do
  case "$m" in
    *-flow.mermaid|*-ui.mermaid|*-db.mermaid|*-erd.mermaid|./09-db/all-erds.mermaid) ;;
    *)
      bad_mermaid_names+=("$m")
      ;;
  esac
done < <(find . -type f -name "*.mermaid" | sort)

# Report
echo
echo "=== VALIDATION REPORT ==="
if ((${#missing_pairs[@]})); then
  echo "Missing db-effects for flows:"
  printf ' - %s\n' "${missing_pairs[@]}"
else
  echo "All flows have matching -db-effects.md ✅"
fi

echo
if ((${#orphan_effects[@]})); then
  echo "Orphan db-effects (no matching flow):"
  printf ' - %s\n' "${orphan_effects[@]}"
else
  echo "No orphan db-effects ✅"
fi

echo
if ((${#bad_mermaid_names[@]})); then
  echo "Files with non-standard .mermaid names:"
  printf ' - %s\n' "${bad_mermaid_names[@]}"
else
  echo "All .mermaid files use approved suffixes ✅"
fi

# Exit non-zero if any issues
if ((${#missing_pairs[@]} + ${#orphan_effects[@]} + ${#bad_mermaid_names[@]})); then
  exit 1
fi

