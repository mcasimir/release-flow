'use strict';

module.exports = require('lodash').template(`
# [<%- release.name %>](<%- release.git.commitLink(release.name) %>)
<% release.commits.forEach(function(commit) { %>
- <%- commit.header %><% }); %>

`.trim());
