{% if release.previous -%}
## [{{ release.name }}]({{ release.git.compareLink(release.previous, release.name) }})
{% else -%}
## [{{ release.name }}]({{ release.git.commitLink(release.name) }})
{% endif %}
{% for commits in release.commits|groupBy('type') -%}
{% if loop.key === 'feat' || loop.key === 'fix' -%}

{% if loop.key === 'feat' -%}
### Features
{% elseif loop.key === 'fix' -%}
### Fixes
{% endif %}
{% for commit in commits -%}
- {% if commit.scope %}**{{commit.scope}}** - {% endif %}{{ commit.subject }} [{{ commit.shortHash }}]({{ release.git.commitLink(commit.shortHash) }})
{% endfor -%}

{% endif -%}
{% endfor -%}
