async function getData() {
  const fetchJSON = async (url) => {
    const response = await fetch(url).then((response) => response);
    return response.json();
  };

  const players = await fetchJSON('./config/players.json');
  const stages = await fetchJSON('./config/stages.json');
  return {
    players: players.players,
    stages: stages.stages,
  };
}

function generateTable(players, stages) {
  const table = document.createElement('table');
  table.classList.add('table', 'table--main');
  document.querySelector('.container--main').appendChild(table);

  for (let i = 0; i < players.length + 1; i++) {
    let tr = document.createElement('tr');

    if (i == 0) {
      for (let j = 0; j < stages.length + 3; j++) {
        let th = document.createElement('th');
        th.classList.add('table__head');
        switch (j) {
          case 0:
            th.innerText = '#';
            break;
          case 1:
            th.innerText = 'Player';
            break;
          case stages.length + 2:
            th.classList.add('table__head--centered');
            th.innerText = 'Pts';
            break;
          default:
            th.classList.add('table__head--centered');
            th.innerText = stages[j - 2].id;
            th.setAttribute('title', stages[j - 2].name);
        }
        tr.appendChild(th);
      }
      table.appendChild(tr);
      continue;
    }

    for (let j = 0; j < stages.length + 3; j++) {
      let td = document.createElement('td');

      switch (j) {
        case 0:
          td.innerText = i;
          break;
        case 1:
          td.id = `player-${i}`;
          break;
        case stages.length + 2:
          td.id = `points-${i}`;
          td.classList.add('table__points');
          break;
        default:
          td.id = `stage-${i}-${j - 2}`;
          td.classList.add('table__stage');
      }

      tr.appendChild(td);
    }

    table.appendChild(tr);
  }
}

function round(e) {
  return e % 1 === 0
    ? e.toFixed(0)
    : e.toFixed(2)[e.toFixed(2).length - 1] === '0'
    ? e.toFixed(1)
    : e.toFixed(2);
}

function handleData(data) {
  const playersData = [];
  const players = data.players;
  const points = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

  for (let i = 0; i < players.length; i++) {
    playersData[i] = {
      name: players[i].name,
      team: players[i].team,
      positions: players[i].positions,
      points: players[i].positions.map((el) => points[el - 1] || 0),
    };
  }

  for (let i = 0; i < playersData[0].points.length; i++) {
    let playerPositions = playersData.map((el) => el.positions[i]);
    let positionsCount = new Array(10).fill(0);
    playerPositions.forEach((el) => {
      if (el > 10) return;
      positionsCount[el - 1]++;
    });
    positionsCount.forEach((el, index) => {
      if (el > 1) {
        let pointsForPosition = round(
          points.slice(index, index + el).reduce((a, b) => a + b) / el
        );
        for (let j = 0; j < playersData.length; j++) {
          if (playersData[j].positions[i] == index + 1) {
            playersData[j].points[i] = pointsForPosition || 0;
          }
        }
      }
    });
  }

  for (let i = 0; i < playersData.length; i++) {
    try {
      playersData[i].totalPoints = round(
        playersData[i].points.reduce((a, b) => Number(a) + Number(b))
      );
    } catch (error) {
      playersData[i].totalPoints = 0;
    }
  }
  playersData.sort((a, b) => b.totalPoints - a.totalPoints);

  return playersData;
}

function updateTable(playersData) {
  for (let i = 0; i < playersData.length; i++) {
    document.getElementById(`player-${i + 1}`).innerText = playersData[i].name;
    document.getElementById(`points-${i + 1}`).innerText =
      playersData[i].totalPoints;
    for (let j = 0; j < playersData[i].points.length; j++) {
      document.getElementById(`stage-${i + 1}-${j}`).innerText =
        playersData[i].points[j];
      switch (playersData[i].positions[j]) {
        case 1:
          document
            .getElementById(`stage-${i + 1}-${j}`)
            .classList.add('table__stage--gold');
          break;
        case 2:
          document
            .getElementById(`stage-${i + 1}-${j}`)
            .classList.add('table__stage--silver');
          break;
        case 3:
          document
            .getElementById(`stage-${i + 1}-${j}`)
            .classList.add('table__stage--bronze');
          break;
        default:
          if (playersData[i].positions[j] < 11) {
            document
              .getElementById(`stage-${i + 1}-${j}`)
              .classList.add('table__stage--points');
          }
      }
    }
  }
}

function handleTeams(playersData) {
  const teamsData = [];
  new Set(playersData.map((el) => el.team)).forEach((el) => {
    teamsData.push({
      team: el,
      players: playersData.filter((player) => el === player.team),
      totalPoints: playersData
        .filter((player) => el === player.team)
        .map((player) => player.totalPoints)
        .reduce((a, b) => Number(a) + Number(b)),
    });
  });
  teamsData.sort((a, b) => b.totalPoints - a.totalPoints);
  return teamsData;
}

function generateTeamsTable(teamsData, playersData, stages) {
  const table = document.createElement('table');
  table.classList.add('table', 'table--teams');
  document.querySelector('.container--teams').appendChild(table);

  for (let i = 0; i < teamsData.length + 1; i++) {
    if (i == 0) {
      let tr = document.createElement('tr');
      for (let j = 0; j < stages.length + 3; j++) {
        let th = document.createElement('th');
        th.classList.add('table__head');
        switch (j) {
          case 0:
            th.innerText = '#';
            break;
          case 1:
            th.innerText = 'Team';
            break;
          case stages.length + 2:
            th.classList.add('table__head--centered');
            th.innerText = 'Pts';
            th.colSpan = 2;
            break;
          default:
            th.classList.add('table__head--centered');
            th.innerText = stages[j - 2].id;
            th.setAttribute('title', stages[j - 2].name);
        }
        tr.appendChild(th);
      }
      table.appendChild(tr);
      continue;
    }

    let tr = document.createElement('tr');
    for (let j = 0; j < stages.length + 3; j++) {
      let td = document.createElement('td');
      switch (j) {
        case 0:
          td.innerText = i;
          td.rowSpan = 2;
          break;
        case 1:
          td.innerHTML = '<div>' + teamsData[i - 1].team + '</div>';
          td.classList.add('table__team');
          td.id = teamsData[i - 1].team.toLowerCase().split(' ').join('-');
          td.rowSpan = 2;
          break;
        case stages.length + 2:
          td.innerText = round(teamsData[i - 1].totalPoints);
          td.rowSpan = 2;
          break;
        default:
          td.innerText =
            teamsData[i - 1].players[0].points[j - 2] == undefined
              ? null
              : teamsData[i - 1].players[0].points[j - 2];
          td.classList.add('table__stage');
          switch (teamsData[i - 1].players[0].positions[j - 2]) {
            case 1:
              td.classList.add('table__stage--gold');
              break;
            case 2:
              td.classList.add('table__stage--silver');
              break;
            case 3:
              td.classList.add('table__stage--bronze');
              break;
            default:
              if (teamsData[i - 1].players[0].positions[j - 2] < 11) {
                td.classList.add('table__stage--points');
              }
          }
      }
      tr.appendChild(td);
    }
    table.appendChild(tr);

    let tr2 = document.createElement('tr');
    for (let j = 0; j < stages.length; j++) {
      let td = document.createElement('td');
      switch (j) {
        default:
          td.innerText =
            teamsData[i - 1].players[1].points[j] == undefined
              ? null
              : teamsData[i - 1].players[1].points[j];
          td.classList.add('table__stage');
          switch (teamsData[i - 1].players[1].positions[j]) {
            case 1:
              td.classList.add('table__stage--gold');
              break;
            case 2:
              td.classList.add('table__stage--silver');
              break;
            case 3:
              td.classList.add('table__stage--bronze');
              break;
            default:
              if (teamsData[i - 1].players[1].positions[j] < 11) {
                td.classList.add('table__stage--points');
              }
          }
      }
      tr2.appendChild(td);
    }
    table.appendChild(tr2);
  }
}

function cleanTable(playersData, stages) {
  const stagesAmount = playersData[0].positions.length;
  document.querySelectorAll('.table--main > tr').forEach((tr) => {
    for (let i = stagesAmount + 2; i < stages.length + 2; i++) {
      tr.children[stagesAmount + 2].remove();
    }
  });

  document.querySelectorAll('.table--teams > tr').forEach((tr, index) => {
    if (index % 2 == 1 || index == 0) {
      for (let i = stagesAmount + 2; i < stages.length + 2; i++) {
        tr.children[stagesAmount + 2].remove();
      }
    } else {
      for (let i = stagesAmount; i < stages.length; i++) {
        tr.children[stagesAmount].remove();
      }
    }
  });
}

(async () => {
  const data = await getData();
  generateTable(data.players, data.stages);
  const playersData = handleData(data);
  updateTable(playersData);
  const teamsData = handleTeams(playersData);
  generateTeamsTable(teamsData, playersData, data.stages);
  cleanTable(playersData, data.stages);
})();
