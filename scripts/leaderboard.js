async function getUsers() {
  try {
    let users = (await ((await fetch('https://math-falta.vercel.app/api/users')).json())).data;
    users = users.sort((user1, user2) => user2.totalScore - user1.totalScore);
    console.log(users);
    return users;
  } catch (err) {
    console.log(err);
  }
}

async function showUsers() {
  try {
    let users = await getUsers();
    users.forEach((user, i) => {
      let quizzeslis = ``;
      if (user.quizzes.length > 0) {
        for (let i = 0; i < user.quizzes.length; i++) {
          quizzeslis += `
            <li>
              <div class="quiz-topic">${user.quizzes[i].topic}</div>
              <div class="quiz-score">${user.quizzes[i].score}</div>
            </li>
          `;
        }
      } else quizzeslis = `<div>No Quizzes Solved</div>`;

      let li = `
          <li class="leader-item">
            <div class="rank">${
              i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1
            }</div>
            <div class="meta">
              <div class="name">${user.username}</div>
            </div>
            <div class="sub">
              <h3>Quizzes</h3>
              <ul>
                ${quizzeslis}
              </ul>
            </div>
            <div class="score">${user.totalScore}</div>
          </li>
        `;

      document.querySelector(".leaderboard").innerHTML += li;
      document.querySelectorAll(".leaderboard li").forEach((li) => {
        li.onclick = function () {
          this.classList.toggle("open");
        };
      });
    });
  } catch (err) {
    console.log(err);
  }
}

showUsers()