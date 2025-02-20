
    // Sample data - In a real application, this would come from a server
    let teams = [
   
      ];
  
      let matches = [
      ];
  
      // Tab functionality
      document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
          document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
          document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
          tab.classList.add('active');
          document.getElementById(tab.dataset.tab).classList.add('active');
        });
      });
  
      // Set current date
      document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
  
      // Find team by ID
      function getTeam(id) {
        return teams.find(team => team.id === id);
      }
  
      // Render matches
      function renderMatches() {
        const container = document.getElementById('matches-container');
        container.innerHTML = '';
        matches.forEach(match => {
          const team1 = getTeam(match.team1);
          const team2 = getTeam(match.team2);
          const matchCard = document.createElement('div');
          matchCard.className = 'match-card';
          matchCard.innerHTML = `
            <div class="match-header">
              <span>${match.group || 'Tournament Match'}</span>
              <span class="match-status status-${match.status}">${match.status.toUpperCase()}</span>
            </div>
            <div class="match-content">
              <div class="team">
                <div class="team-logo"><span>${team1.logo}</span></div>
                <div class="team-name">${team1.name}</div>
              </div>
              <div class="score-container">
                <span class="score">${match.score1}</span>
                <span class="score-divider">-</span>
                <span class="score">${match.score2}</span>
              </div>
              <div class="team">
                <div class="team-logo"><span>${team2.logo}</span></div>
                <div class="team-name">${team2.name}</div>
              </div>
            </div>
            <div class="match-footer">${match.time}</div>
          `;
          container.appendChild(matchCard);
        });
      }
  
      // Calculate standings
      function calculateStandings() {
        const standings = teams.map(team => ({
          id: team.id,
          name: team.name,
          logo: team.logo,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0
        }));
  
        matches.forEach(match => {
          if (match.status === 'completed') {
            const team1Standing = standings.find(standing => standing.id === match.team1);
            const team2Standing = standings.find(standing => standing.id === match.team2);
            team1Standing.played++;
            team1Standing.goalsFor += match.score1;
            team1Standing.goalsAgainst += match.score2;
            team2Standing.played++;
            team2Standing.goalsFor += match.score2;
            team2Standing.goalsAgainst += match.score1;
            if (match.score1 > match.score2) {
              team1Standing.won++;
              team1Standing.points += 3;
              team2Standing.lost++;
            } else if (match.score1 < match.score2) {
              team2Standing.won++;
              team2Standing.points += 3;
              team1Standing.lost++;
            } else {
              team1Standing.drawn++;
              team1Standing.points++;
              team2Standing.drawn++;
              team2Standing.points++;
            }
          }
        });
  
        standings.forEach(team => {
          team.goalDifference = team.goalsFor - team.goalsAgainst;
        });
  
        standings.sort((a, b) => {
          if (a.points !== b.points) return b.points - a.points;
          if (a.goalDifference !== b.goalDifference) return b.goalDifference - a.goalDifference;
          return b.goalsFor - a.goalsFor;
        });
        return standings;
      }
  
      // Render standings
      function renderStandings() {
        const standings = calculateStandings();
        const tbody = document.getElementById('standings-body');
        tbody.innerHTML = '';
        standings.forEach((team, index) => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${index + 1}</td>
            <td>
              <div class="team-cell">
                <div class="team-logo"><span>${team.logo}</span></div>
                <span>${team.name}</span>
              </div>
            </td>
            <td>${team.played}</td>
            <td>${team.won}</td>
            <td>${team.drawn}</td>
            <td>${team.lost}</td>
            <td>${team.goalsFor}</td>
            <td>${team.goalsAgainst}</td>
            <td>${team.goalDifference}</td>
            <td><strong>${team.points}</strong></td>
          `;
          tbody.appendChild(row);
        });
      }
  
      // Render groups
      function renderGroups() {
        const groupsContainer = document.getElementById('groups-container');
        groupsContainer.innerHTML = '';
        const groups = [...new Set(matches.map(match => match.group).filter(Boolean))];
        groups.forEach(groupName => {
          const groupCard = document.createElement('div');
          groupCard.className = 'group-card';
          const groupMatches = matches.filter(match => match.group === groupName);
          const groupTeamIds = new Set();
          groupMatches.forEach(match => {
            groupTeamIds.add(match.team1);
            groupTeamIds.add(match.team2);
          });
          const groupStandings = calculateStandings().filter(team => groupTeamIds.has(team.id));
          let standingsHTML = '';
          groupStandings.forEach((team, index) => {
            standingsHTML += `
              <tr>
                <td>${index + 1}</td>
                <td>
                  <div class="team-cell">
                    <div class="team-logo"><span>${team.logo}</span></div>
                    <span>${team.name}</span>
                  </div>
                </td>
                <td>${team.played}</td>
                <td>${team.points}</td>
              </tr>
            `;
          });
          groupCard.innerHTML = `
            <div class="group-header">${groupName}</div>
            <table class="standings-table">
              <thead>
                <tr>
                  <th>Pos</th>
                  <th>Team</th>
                  <th>P</th>
                  <th>Pts</th>
                </tr>
              </thead>
              <tbody>
                ${standingsHTML}
              </tbody>
            </table>
          `;
          groupsContainer.appendChild(groupCard);
        });
      }
  
      // Populate admin dropdowns
      function populateAdminControls() {
        const matchSelect = document.getElementById('match-select');
        const newTeam1 = document.getElementById('new-team1');
        const newTeam2 = document.getElementById('new-team2');
        matchSelect.innerHTML = '<option value="">Select a match...</option>';
        newTeam1.innerHTML = '<option value="">Select a team...</option>';
        newTeam2.innerHTML = '<option value="">Select a team...</option>';
        matches.forEach(match => {
          const team1 = getTeam(match.team1);
          const team2 = getTeam(match.team2);
          const option = document.createElement('option');
          option.value = match.id;
          option.textContent = `${team1.name} vs ${team2.name} (${match.time})`;
          matchSelect.appendChild(option);
        });
        teams.forEach(team => {
          const option1 = document.createElement('option');
          option1.value = team.id;
          option1.textContent = team.name;
          newTeam1.appendChild(option1);
          const option2 = document.createElement('option');
          option2.value = team.id;
          option2.textContent = team.name;
          newTeam2.appendChild(option2);
        });
      }
  
      // Event handlers for admin controls
      function setupAdminControls() {
        const matchSelect = document.getElementById('match-select');
        const team1Score = document.getElementById('team1-score');
        const team2Score = document.getElementById('team2-score');
        const matchStatus = document.getElementById('match-status');
        const updateScoreBtn = document.getElementById('update-score-btn');
        const newTeam1 = document.getElementById('new-team1');
        const newTeam2 = document.getElementById('new-team2');
        const newMatchTime = document.getElementById('new-match-time');
        const newMatchGroup = document.getElementById('new-match-group');
        const addMatchBtn = document.getElementById('add-match-btn');
  
        // Update match score
        updateScoreBtn.addEventListener('click', () => {
          const matchId = parseInt(matchSelect.value);
          if (!matchId) {
            alert('Please select a match!');
            return;
          }
          const match = matches.find(m => m.id === matchId);
          match.score1 = parseInt(team1Score.value) || 0;
          match.score2 = parseInt(team2Score.value) || 0;
          match.status = matchStatus.value;
          renderAll();
          alert('Match updated successfully!');
        });
  
        // Populate score inputs when a match is selected
        matchSelect.addEventListener('change', () => {
          const matchId = parseInt(matchSelect.value);
          if (!matchId) return;
          const match = matches.find(m => m.id === matchId);
          team1Score.value = match.score1;
          team2Score.value = match.score2;
          matchStatus.value = match.status;
        });
  
        // Add new match
        addMatchBtn.addEventListener('click', () => {
          const team1Id = parseInt(newTeam1.value);
          const team2Id = parseInt(newTeam2.value);
          const time = newMatchTime.value;
          const group = newMatchGroup.value;
          if (!team1Id || !team2Id) {
            alert('Please select both teams!');
            return;
          }
          if (team1Id === team2Id) {
            alert('Please select different teams!');
            return;
          }
          if (!time) {
            alert('Please enter a match time!');
            return;
          }
          const newId = Math.max(...matches.map(m => m.id)) + 1;
          matches.push({
            id: newId,
            team1: team1Id,
            team2: team2Id,
            score1: 0,
            score2: 0,
            status: 'upcoming',
            time: time,
            group: group || null
          });
          renderAll();
          populateAdminControls();
          newTeam1.value = '';
          newTeam2.value = '';
          newMatchTime.value = '';
          newMatchGroup.value = '';
          alert('Match added successfully!');
        });
  
        // Team management functionality
        setupTeamManagement();
      }
  
      // Team management functionality
      function setupTeamManagement() {
        const addTeamBtn = document.getElementById('add-team-btn');
        const newTeamName = document.getElementById('new-team-name');
        const newTeamLogo = document.getElementById('new-team-logo');
        const editModal = document.getElementById('edit-team-modal');
        const modalClose = document.querySelector('.modal-close');
        let editingTeamId = null;
  
        function renderExistingTeams() {
          const container = document.querySelector('.existing-teams');
          container.innerHTML = '';
          
          teams.forEach(team => {
            const teamItem = document.createElement('div');
            teamItem.className = 'team-item';
            teamItem.innerHTML = `
              <div class="team-item-info">
                <div class="team-logo">
                  <span>${team.logo}</span>
                </div>
                <div class="team-name">${team.name}</div>
              </div>
              <div class="team-item-actions">
                <button class="button-edit" data-team-id="${team.id}">Edit</button>
                <button class="button-danger" data-team-id="${team.id}">Delete</button>
              </div>
            `;
            container.appendChild(teamItem);
          });
        }
  
        // Add new team
        addTeamBtn.addEventListener('click', () => {
          const name = newTeamName.value.trim();
          const logo = newTeamLogo.value.trim().toUpperCase();
          
          if (!name || !logo) {
            alert('Please enter both team name and logo!');
            return;
          }
          
          if (logo.length > 3) {
            alert('Logo should be 2-3 characters!');
            return;
          }
          
          const newId = Math.max(...teams.map(t => t.id)) + 1;
          teams.push({
            id: newId,
            name: name,
            logo: logo
          });
          
          newTeamName.value = '';
          newTeamLogo.value = '';
          renderExistingTeams();
          renderAll();
          populateAdminControls();
        });
  
        // Edit team
        document.querySelector('.existing-teams').addEventListener('click', (e) => {
          const editBtn = e.target.closest('.button-edit');
          const deleteBtn = e.target.closest('.button-danger');
          
          if (editBtn) {
            const teamId = parseInt(editBtn.dataset.teamId);
            const team = teams.find(t => t.id === teamId);
            editingTeamId = teamId;
            
            document.getElementById('edit-team-name').value = team.name;
            document.getElementById('edit-team-logo').value = team.logo;
            editModal.style.display = 'flex';
          }
          
          if (deleteBtn) {
            const teamId = parseInt(deleteBtn.dataset.teamId);
            if (confirm('Are you sure you want to delete this team?')) {
              const hasMatches = matches.some(m => m.team1 === teamId || m.team2 === teamId);
              if (hasMatches) {
                alert('Cannot delete team with existing matches!');
                return;
              }
              teams = teams.filter(t => t.id !== teamId);
              renderExistingTeams();
              renderAll();
              populateAdminControls();
            }
          }
        });
  
        // Save team edits
        document.getElementById('save-team-edit-btn').addEventListener('click', () => {
          const name = document.getElementById('edit-team-name').value.trim();
          const logo = document.getElementById('edit-team-logo').value.trim().toUpperCase();
          
          if (!name || !logo) {
            alert('Please enter both team name and logo!');
            return;
          }
          
          if (logo.length > 3) {
            alert('Logo should be 2-3 characters!');
            return;
          }
          
          const team = teams.find(t => t.id === editingTeamId);
          team.name = name;
          team.logo = logo;
          
          editModal.style.display = 'none';
          renderExistingTeams();
          renderAll();
          populateAdminControls();
        });
  
        // Close modal
        modalClose.addEventListener('click', () => {
          editModal.style.display = 'none';
        });
  
        // Close modal on outside click
        editModal.addEventListener('click', (e) => {
          if (e.target === editModal) {
            editModal.style.display = 'none';
          }
        });
  
        // Initial render
        renderExistingTeams();
      }
  
      // Render teams
      function renderTeams() {
        const container = document.querySelector('.teams-grid');
        container.innerHTML = '';
        
        teams.forEach(team => {
          // Calculate team stats from matches
          const stats = {
            played: 0,
            wins: 0,
            goals: 0
          };
          
          matches.forEach(match => {
            if (match.status === 'completed') {
              if (match.team1 === team.id) {
                stats.played++;
                stats.goals += match.score1;
                if (match.score1 > match.score2) stats.wins++;
              } else if (match.team2 === team.id) {
                stats.played++;
                stats.goals += match.score2;
                if (match.score2 > match.score1) stats.wins++;
              }
            }
          });
  
          const teamCard = document.createElement('div');
          teamCard.className = 'team-card';
          teamCard.innerHTML = `
            <div class="team-logo">
              <span>${team.logo}</span>
            </div>
            <div class="team-name">${team.name}</div>
            <div class="team-stats">
              <div class="stat-item">
                <div class="stat-value">${stats.played}</div>
                <div class="stat-label">Played</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${stats.wins}</div>
                <div class="stat-label">Wins</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${stats.goals}</div>
                <div class="stat-label">Goals</div>
              </div>
            </div>
          `;
          container.appendChild(teamCard);
        });
      }
  
      // Render everything
      function renderAll() {
        renderMatches();
        renderStandings();
        renderGroups();
        renderTeams();
      }
  
      // Setup admin login functionality
      document.getElementById('admin-login-btn').addEventListener('click', () => {
        const username = document.getElementById('admin-username').value;
        const password = document.getElementById('admin-password').value;
        if (username === 'Nst@2006' && password === 'Manmath@2006') {
          document.getElementById('admin-login').style.display = 'none';
          document.getElementById('admin-content').style.display = 'block';
          populateAdminControls();
          setupAdminControls();
          alert('Login successful!');
        } else {
          alert('Invalid credentials!');
        }
      });
  
      // Initialize the page
      document.addEventListener('DOMContentLoaded', () => {
        renderAll();
        // Simulated live updates - in a real app, this would use WebSockets
        setInterval(() => {
          const liveMatches = matches.filter(match => match.status === 'live');
          if (liveMatches.length > 0) {
            const randomMatch = liveMatches[Math.floor(Math.random() * liveMatches.length)];
            if (Math.random() < 0.2) {
              if (Math.random() < 0.5) {
                randomMatch.score1++;
              } else {
                randomMatch.score2++;
              }
              renderAll();
            }
          }
        }, 5000);
      });
    
