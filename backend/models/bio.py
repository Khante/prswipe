from typing import List


def generate_pr_bio(
    additions: int,
    deletions: int,
    changed_files: int,
    commits: int,
    age_days: int,
    draft: bool,
    labels: List[str],
    requested_reviewers: List[str],
) -> str:
    age_priority = []
    code_priority = []
    commits_priority = []
    other_priority = []

    # Age-related (highest priority)
    if age_days > 30:
        age_priority.append(
            f"I've been waiting {age_days} days for someone to notice me."
        )
    elif age_days < 1:
        age_priority.append("Fresh out today. Still warm.")

    # Additions/deletions related
    if additions > 500:
        code_priority.append(
            f"I'm not afraid of commitment — +{additions} lines speak for themselves."
        )
    elif deletions > additions:
        code_priority.append("Minimalist at heart. Here to clean things up.")
    if additions > 1000 and deletions > 500:
        code_priority.append(
            "I live for chaos and refactors. Let's rewrite everything."
        )

    # Files related
    if changed_files == 1:
        code_priority.append("Just one file. I don't like to make things complicated.")
    elif changed_files > 20:
        code_priority.append(f"I touched {changed_files} files. I contain multitudes.")

    # Commits related
    if commits == 1:
        commits_priority.append("One shot, one commit. No regrets.")
    elif commits > 10:
        commits_priority.append(f"{commits} commits deep. I have a complex history.")

    # Other
    if draft:
        other_priority.append("Still figuring myself out. (Draft PR)")
    if requested_reviewers:
        other_priority.append(
            f"Already have {len(requested_reviewers)} eyes on me. High demand."
        )
    if "bug" in labels:
        other_priority.append(
            "I fix broken things. That includes bugs and bad relationships."
        )
    elif "feature" in labels:
        other_priority.append("Here to add value to your life.")
    elif "hotfix" in labels:
        other_priority.append("Emergency services, but make it code.")

    # Build final bio with priority: age > code > commits > other (max 2 lines)
    lines = []
    for line in age_priority[:2]:
        if len(lines) >= 2:
            break
        lines.append(line)

    for line in code_priority[:2]:
        if len(lines) >= 2:
            break
        lines.append(line)

    for line in commits_priority[:2]:
        if len(lines) >= 2:
            break
        lines.append(line)

    for line in other_priority[:2]:
        if len(lines) >= 2:
            break
        lines.append(line)

    if not lines:
        lines.append("Just here to get merged.")

    return "\n".join(lines[:2])


def compute_compatibility_score(
    mergeable: bool,
    age_days: int,
    draft: bool,
    commits: int,
    changed_files: int,
    comments: int,
) -> int:
    def clamp(value: int, min_val: int, max_val: int) -> int:
        return max(min_val, min(max_val, value))

    score = (
        50
        + (10 if mergeable is True else (-20 if mergeable is False else 0))
        + clamp(20 - age_days, -20, 10)
        - (5 if draft else 0)
        + (5 if commits <= 5 else 0)
        + (5 if changed_files <= 10 else 0)
        + (5 if comments > 0 else 0)
    )

    return clamp(score, 0, 100)
