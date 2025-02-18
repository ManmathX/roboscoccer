const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = 'data.json';

app.use(bodyParser.json());

// Default data structure
let data = {
  teams: [
    { id: 1, name: "RoboWarriors", logo: "RW" },
    { id: 2, name: "TechTitans", logo: "TT" },
    { id: 3, name: "MechMasters", logo: "MM" },
    { id: 4, name: "ByteBots", logo: "BB" },
    { id: 5, name: "CircuitCrusaders", logo: "CC" },
    { id: 6, name: "AlgoAthletes", logo: "AA" },
    { id: 7, name: "DigitalDynamos", logo: "DD" },
    { id: 8, name: "CodeCommandos", logo: "CD" }
  ],
  matches: [
    { id: 1, team1: 1, team2: 2, score1: 2, score2: 1, status: "completed", time: "13:00, Feb 17", group: "Group A" },
    { id: 2, team1: 3, team2: 4, score1: 1, score2: 1, status: "live", time: "Now", group: "Group A" },
    { id: 3, team1: 5, team2: 6, score1: 0, score2: 0, status: "upcoming", time: "16:00, Feb 17", group: "Group B" },
    { id: 4, team1: 7, team2: 8, score1: 0, score2: 0, status: "upcoming", time: "18:00, Feb 17", group: "Group B" }
  ]
};

// Load data from file if it exists
function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  }
}

// Save data to file for persistence
function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Initialize data from file
loadData();

// Get all teams
app.get('/api/teams', (req, res) => {
  res.json(data.teams);
});

// Get all matches
app.get('/api/matches', (req, res) => {
  res.json(data.matches);
});

// Add a new match
app.post('/api/matches', (req, res) => {
  const newMatch = req.body;
  newMatch.id = data.matches.length ? Math.max(...data.matches.map(m => m.id)) + 1 : 1;
  data.matches.push(newMatch);
  saveData();
  res.status(201).json(newMatch);
});

// Update an existing match (e.g., updating score, status, etc.)
app.put('/api/matches/:id', (req, res) => {
  const matchId = parseInt(req.params.id);
  const index = data.matches.findIndex(m => m.id === matchId);
  if (index === -1) {
    return res.status(404).json({ error: 'Match not found' });
  }
  data.matches[index] = { ...data.matches[index], ...req.body };
  saveData();
  res.json(data.matches[index]);
});

// Calculate and return standings
app.get('/api/standings', (req, res) => {
  const standings = data.teams.map(team => ({
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

  data.matches.forEach(match => {
    if (match.status === 'completed') {
      let team1 = standings.find(t => t.id === match.team1);
      let team2 = standings.find(t => t.id === match.team2);
      team1.played++;
      team1.goalsFor += match.score1;
      team1.goalsAgainst += match.score2;
      team2.played++;
      team2.goalsFor += match.score2;
      team2.goalsAgainst += match.score1;
      if (match.score1 > match.score2) {
        team1.won++;
        team1.points += 3;
        team2.lost++;
      } else if (match.score1 < match.score2) {
        team2.won++;
        team2.points += 3;
        team1.lost++;
      } else {
        team1.drawn++;
        team2.drawn++;
        team1.points++;
        team2.points++;
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

  res.json(standings);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
