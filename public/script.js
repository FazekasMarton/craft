const url = getBackendURL()
const socket = io(url)
socket.emit("login")

let users_per_day_chart = createUsersPerDayChart()
let update_date = null

function getBackendURL() {
  let url = "http://localhost:6969"
  if (window.location.hostname != "localhost") {
    url = "https://guideianangel.herokuapp.com"
  }
  return url
}

socket.on("users", data => {
  displayData(data)
})

function displayData(data) {
  let today = data.todayDate
  document.getElementById("currentPlayers").innerText = `Current Players: ${data.currentPlayers}`
  document.getElementById("todaysPlayers").innerText = `Today's Visitors: ${data.date[today].visitors}`
  document.getElementById("todaysSolvedRiddles").innerText = `Riddles Solved Today: ${data.date[today].solvedRiddles}`
  document.getElementById("streakPerPlayers").innerText = `Average Game Played In A Row: ${avg(data.streakPerPlayers)}`
  document.getElementById("totalPlayers").innerText = `Visitors So Far: ${total(data.date, "visitors")}`
  document.getElementById("totalSolvedRiddles").innerText = `Solved Riddles So Far: ${total(data.date, "solvedRiddles")}`
  if (update_date != today) {
    update_date = today
    updateUsersPerDayChart(data.date, today)
  }
}

function total(data, type){
  let sum = 0
  Object.keys(data).forEach(day => {
    sum += data[day][type]
  });
  return sum
}

function avg(list) {
  let sum = 0
  list.forEach(number => {
    sum += number
  });
  return (sum / list.length).toFixed(2)
}

function updateUsersPerDayChart(data, today) {
  let bars = []
  let visitorsPerDay = {
    label: "Visitors",
    data: [],
    borderWidth: 1
  }
  let solvedRiddlesPerDay = {
    label: "Solved Riddles",
    data: [],
    borderWidth: 1
  }
  Object.keys(data).some(date => {
    if (date == today) {
      return true
    }
    bars.push(`${date.replaceAll("-", ". ")}.`)
    visitorsPerDay.data.push(data[date].visitors)
    solvedRiddlesPerDay.data.push(data[date].solvedRiddles)
    return false
  });
  users_per_day_chart.data.labels = bars
  users_per_day_chart.data.datasets = [visitorsPerDay, solvedRiddlesPerDay]
  users_per_day_chart.update()
}

function createUsersPerDayChart() {
  let ctx = document.getElementById("usersPerDay")
  let users_per_day_chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [],
      datasets: []
    },
    options: {
      plugins: {
        legend: {
          labels: {
            font: {
              family: 'MinecraftRegular',
              size: 20,
              style: 'normal',
              lineHeight: 1.2
            },
            color: "white"
          }
        },
        tooltip: {
          bodyFont: {
            family: 'MinecraftRegular',
            size: 15
          },
          titleFont: {
            family: 'MinecraftRegular',
            size: 15
          }
        }
      },
      scales: {
        x: {
          ticks: {
            font: {
              family: 'MinecraftRegular',
              size: 15,
            },
            color: "white"
          },
          grid: {
            color: "white"
          }
        },
        y: {
          ticks: {
            font: {
              family: 'MinecraftRegular',
              size: 15,
            },
            color: "white"
          },
          grid: {
            color: "white"
          },
          beginAtZero: true
        }
      }
    }
  });
  return users_per_day_chart
}