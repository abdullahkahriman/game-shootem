const scoreDiv = document.getElementById("score");
const killDiv = document.getElementById("kill");
const startDiv = document.getElementById("start");
const startDivBtn = startDiv.querySelector("button");
const startDivParagraph = startDiv.querySelector("p");
const shotMusic = createAudio("shot.wav");
const gameOverMusic = createAudio("game-over.wav");

const canvas = document.getElementById("canvas");
const width = window.innerWidth,
  height = window.innerHeight;
canvas.width = width;
canvas.height = height;

const ctx = canvas.getContext("2d");
clearRect();

canvas.addEventListener("mousemove", handleMouseMove);
canvas.addEventListener("click", handleClick);

class Player {
  /**
   *
   * @param {*} x
   * @param {*} y
   * @param {*} radius Yarıçap
   * @param {*} color Renk
   */
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.r = radius;
    this.c = color;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.fillStyle = this.c;
    ctx.beginPath();
    ctx.arc(0, 0, this.r, 0, Math.PI * 2);
    ctx.fillRect(0, -(this.r * 0.4), this.r + 15, this.r * 0.8);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }
}

class Circle {
  /**
   *
   * @param {*} startX Başlangıç
   * @param {*} finalY Bitiş
   * @param {*} targetX Hefed X konum
   * @param {*} targetY Hedef Y konum
   * @param {*} radius Yarıçap
   * @param {*} color Renk
   * @param {*} speed Hız
   */
  constructor(startX, finalY, targetX, targetY, radius, color, speed) {
    this.bx = startX;
    this.by = finalY;
    this.tx = targetX;
    this.ty = targetY;
    this.x = this.bx;
    this.y = this.by;
    this.r = radius;
    this.c = color;
    this.s = speed;
  }
  draw() {
    ctx.fillStyle = this.c;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }
  update() {
    let distanceX = this.tx - this.bx,
      distanceY = this.ty - this.by,
      hipotenus = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    this.x += (distanceX / hipotenus) * this.s;
    this.y += (distanceY / hipotenus) * this.s;
  }
  remove() {
    let calcX = this.x < 0 || this.x > width,
      calcY = this.y < 0 || this.y > height;
    return calcX || calcY;
  }
}

function handleMouseMove(e) {
  if (playing) {
    let distanceX = e.pageX - player.x,
      distanceY = e.pageY - player.y,
      tetha = Math.atan2(distanceY, distanceX);

    tetha *= 180 / Math.PI;
    angle = tetha;
  }
}

function handleClick(e) {
  if (playing) {
    const circle = new Circle(
      player.x,
      player.y,
      e.pageX,
      e.pageY,
      5,
      "white",
      5
    );
    bullets.push(circle);
  }
}

function clearRect() {
  ctx.clearRect(0, 0, width, height);
}

function addEnemy() {
  for (let index = enemies.length; index < maxEnemy; index++) {
    const random = Math.random() * 30 + 10,
      color = `hsl(${Math.random() * 360},40%,50%)`,
      speed = 0.5 + (40 - (random / 40) * random) / 160 / maxEnemy; // düşman sayısı arttıkça hızı düşürüyoruz

    let x, y;
    if (Math.random() < 0.5) {
      x = Math.random() > 0.5 ? width : 0;
      y = Math.random() * height;
    } else {
      x = Math.random() * width;
      y = Math.random() < 0.5 ? height : 0;
    }

    const circle = new Circle(x, y, player.x, player.y, random, color, speed);
    enemies.push(circle);
  }
}

function collision(x1, y1, r1, x2, y2, r2) {
  const distanceX = x1 - x2,
    distanceY = y1 - y2,
    hipotenus = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

  return hipotenus < r1 + r2;
}

function animate() {
  if (playing) {
    requestAnimationFrame(animate);
    ctx.fillStyle = "rgba(0,0,0,.1)";
    ctx.fillRect(0, 0, width, height);
    ctx.fill();

    bullets.forEach((bullet, bi) => {
      if (bullet.remove()) {
        bullets.splice(bi, 1);
      }

      bullet.update();
      bullet.draw();
    });

    enemies.forEach((enemy, ei) => {
      bullets.forEach((bullet, bi) => {
        if (
          collision(enemy.x, enemy.y, enemy.r, bullet.x, bullet.y, bullet.r)
        ) {
          shotMusic.pause();
          shotMusic.currentTime = 0;
          console.log("hedef vuruldu");
          shotMusic.play();
          if (enemy.r < 15) {
            enemies.splice(ei, 1);
            scoreCount += 25;
            killCount++;
            if (killCount % 5 === 0) maxEnemy++; //her 5 kill'de düşman sayısını artır.
            addEnemy();
          } else {
            enemy.r -= 5;
            scoreCount += 5;
          }

          bullets.splice(bi, 1);
        }
      });

      if (collision(enemy.x, enemy.y, enemy.r, player.x, player.y, player.r)) {
        console.log("oyun bitti");
        gameOverMusic.play();
        startDivBtn.textContent = "TRY AGAIN";
        startDivParagraph.innerHTML = `<b>Game Over</b><br/>
                                       Score: ${scoreCount}<br/>
                                       Total Kill: ${killCount}`;
        startDiv.classList.add("show");
        playing = false;
      }
      if (enemy.remove()) {
        enemies.splice(ei, 1);
        addEnemy();
      }

      enemy.update();
      enemy.draw();
    });

    player.draw();
    scoreDiv.innerHTML = `Score : ${scoreCount}`;
    killDiv.innerHTML = `Kill : ${killCount}`;
  }
}

function createAudio(src) {
  const audio = document.createElement("audio");
  audio.src = src;
  document.querySelector("body").appendChild(audio);
  return audio;
}

function init() {
  playing = true;
  startDiv.classList.remove("show");
  scoreCount = 0;
  killCount = 0;
  angle = 45;
  bullets = []; //mermiler
  enemies = []; //düşmanlar
  maxEnemy = 5; //max. düşman
  player = new Player(width / 2, height / 2, 20, "white");
  addEnemy();
  animate();
}

let player,
  playing = true,
  angle,
  bullets,
  enemies,
  maxEnemy,
  scoreCount,
  killCount;
init();
