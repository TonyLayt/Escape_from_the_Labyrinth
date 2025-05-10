let firstPosTramble = 0;
let textOFForON = "OFF"
class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    preload() {
        this.load.image('backgroundMain', 'assets/backgroundMain.png');
        this.load.image('StartButton', 'assets/HUD/BtnStartGame.svg');
        this.load.image('BtnOptions', 'assets/HUD/BtnOptions.svg');
        this.load.image('BtnExit', 'assets/HUD/BtnExit.svg');
    }

    create() {
        let centerX = this.scale.width / 2;
        let centerY = this.scale.height / 2;
        firstPosTramble = centerX;

        this.add.image(centerX, centerY, 'backgroundMain');
            

        let startButton = this.add.image(centerX, centerY - 100, 'StartButton')
            .setInteractive()
            .setScale(0.5);

        addButtonEffects(startButton);

        
        let settingsButton = this.add.image(centerX, centerY, 'BtnOptions')
            .setInteractive()
            .setScale(0.5);

        addButtonEffects(settingsButton);
        console.log ("1. ", firstPosTramble);
        startButton.on('pointerdown', () => {
            //this.scale.startFullscreen();
            this.scene.start('GameScene');
        });
    }
}
let numlvl = 1;
let lvlsizeX = 10; 
let lvlsizeY = 10;

let volumeLevel = 0.5;
let sliderThumbX = 0;


class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.pause = false;
    }

    preload() {

        for (let i = 1; i <= 19; i++) {
            this.load.image(`frameMove${i}`, `assets/player/move_${i}.png`);
        }
        for (let i = 1; i <= 19; i++) {
            this.load.image(`frameMoveFeet${i}`, `assets/player/feet/run_${i}.png`);
        }

        for (let i = 1; i <= 19; i++) {
            this.load.image(`idle${i}`, `assets/player/idle/idle_${i}.png`);
        }

        this.load.image('btnMiniOptions', 'assets/HUD/btnMiniOptions.png');
        this.load.image('fogTexture', 'assets/fog.png');
        this.load.image({key: 'backgroundGamePlace', url: 'assets/floor44.png', normalMap: 'assets/floor44_n.png'});
        this.load.image({key: 'wallTexture', url: 'assets/foliage33.png', normalMap: 'assets/foliage33_n.png'});
        this.load.image('door', 'assets/door.png');
        this.load.image('light', 'assets/light.png');
        this.load.image('lightMask', 'assets/light2.png');
        this.load.image('backgroundPause', 'assets/HUD/BackMiniMenu.png');
        this.load.image('btnContinue', 'assets/HUD/btnContinue.png');
        this.load.image('btnOptions', 'assets/HUD/btnOptions.png');
        this.load.image('btnArrowBack', 'assets/HUD/arrowBack.png');
        this.load.image('btnFullScreen', 'assets/HUD/btnFullScrean.png');
        this.load.image('imgSoundEffects', 'assets/HUD/SoundEffects.png');
        this.load.image('BtnExitPause', 'assets/HUD/btnExit2.png');
        this.load.image('hudMonitor', 'assets/HUD/hud_monitor.png');
        this.load.image('key', 'assets/item/Key.webp');
        this.load.audio('upkey', 'assets/sounds/upkey.mp3');
        this.load.audio('closedor', 'assets/sounds/closedor.mp3');
        this.load.audio('steps', 'assets/sounds/step.mp3');
        this.load.audio('les', 'assets/sounds/les.mp3');
        

    }
  
    create() {
        this.flickerTime = 0;
        this.keySprites = [];
        this.countKes = 0;
        this.stepSound = this.sound.add('steps');
        this.lesSound = this.sound.add('les', {volume: volumeLevel, loop: true});
        this.upkeySound = this.sound.add('upkey');
        this.closeDorSound = this.sound.add('closedor');
        this.lesSound.play();
        let idlePlayerFrame = [];
        let movePlayerFrame = [];
        let movePlayerFeetFrame = [];
        for (let i = 1; i <= 19; i++) {
            movePlayerFrame.push({ key: `frameMove${i}` });
            movePlayerFeetFrame.push({ key: `frameMoveFeet${i}` });
            idlePlayerFrame.push({ key: `idle${i}` });
        }

        this.anims.create({
            key: 'idle',
            frames: idlePlayerFrame, // Передаем массив кадров
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'walk',
            frames: movePlayerFrame, // Передаем массив кадров
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'feetmove',
            frames: movePlayerFeetFrame, // Передаем массив кадров
            frameRate: 30,
            repeat: -1
        });


        this.cellSize = 40; // Розмір однієї клітинки лабіринту
        
        this.cols = Math.floor(this.scale.width / this.cellSize) + lvlsizeY;
        this.rows = Math.floor(this.scale.height / this.cellSize) + lvlsizeX;
         
        this.grid = this.generateMaze(this.cols, this.rows);
        
        // размер всей карти 
        let mapWidth = this.cellSize * this.cols;
        let mapHeight = this.cellSize * this.rows;

        let bgTilesX = Math.ceil(mapWidth / 204);
        let bgTilesY = Math.ceil(mapHeight / 204);


        //рисуем бек фон по всей области
        for (let countX = 0; countX < bgTilesX; countX++) {
            for (let countY = 0; countY < bgTilesY; countY++) {
                this.add.sprite(
                    countX * 204,
                    countY * 204,
                    'backgroundGamePlace'
                ).setOrigin(0, 0).setScale(0.2).setPipeline('Light2D'); 
            }
        }
        
        this.fog = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'fogTexture')
            .setOrigin(0)
            .setAlpha(0.1)
            .setScale(4)
            .setDepth(1000); // Розміщуємо поверх усього

        this.drawMaze();
   
        this.playerFeet = this.add.sprite(this.cellSize / 2, this.cellSize * 1.5);

        this.glowEffect = this.add.image(this.cellSize / 2 + 80, this.cellSize * 1.5, 'light');
        this.glowEffect.setScale(0.1); 
        this.glowEffect.setAlpha(0.2); // Прозрачность
        this.glowEffect.setRotation(Phaser.Math.DegToRad(-90));

        this.player = this.add.sprite(this.cellSize / 2 + 30, this.cellSize * 1.5);
        
        this.player.setOrigin(0.5, 0.5);
        this.player.setScale(this.cellSize / 280);
        this.playerFeet.setOrigin(0.5, 0.5);
        this.playerFeet.setScale(this.cellSize / 290);

        //камера
        this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
        this.cameras.main.setZoom(1.7);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);


        //фонарик
        this.lights.enable().setAmbientColor(0x555555); // Налаштування фонового освітлення;
        this.playerLight = this.lights.addLight(this.player.x + 90, this.player.y, 250).setIntensity(2.0);
        //фонарик 
        
        this.btnMiniOptions = this.add.image(this.scale.width / 4.6, this.scale.height / 4.6, 'btnMiniOptions')
            .setAlpha(0.7)
            .setOrigin(0, 0) 
            .setScrollFactor(0)
            .setScale(this.cellSize / 150)
            .setInteractive()
            .on('pointerover', function () {this.setTint(0xBDBDBD);})
            .on('pointerout', function () {this.clearTint();})
            .on('pointerdown', () => {this.pauseGame(); this.btnMiniOptions.disableInteractive(); this.pause = true;});
        
        //hudMonitor
        // счетчик уровня, ключей
        this.add.image(this.scale.width / 2, this.scale.height / 4.3, 'hudMonitor')
            .setAlpha(0.6)      
            .setScrollFactor(0)
            .setScale(this.cellSize / 150);
        this.add.text(this.scale.width / 1.84, this.scale.height / 4.29, numlvl, {
            fontSize: '24px',
            color: '#000000',
            fontFamily: 'Inknut Antiqua',
            align: 'center'
        }).setOrigin(0.5) 
            .setScrollFactor(0)
            .setScale(this.cellSize / 80);
        this.forUpdateCountKeys = this.add.text(this.scale.width / 2.12, this.scale.height / 4.29, this.countKes + "/2", {
            fontSize: '24px',
            color: '#000000',
            fontFamily: 'Inknut Antiqua',
            align: 'center'
        }).setOrigin(0.5) 
            .setScrollFactor(0)
            .setScale(this.cellSize / 80);
        //hudMonitor

        this.scale.on('enterfullscreen', () => {
            textOFForON = "ON";
            this.forbtnFullScreen.setText(textOFForON);
        });
    
        this.scale.on('leavefullscreen', () => {
            textOFForON = "OFF";
            this.forbtnFullScreen.setText(textOFForON);
        });

        this.keybtn = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.UP,
            down: Phaser.Input.Keyboard.KeyCodes.DOWN,
            left: Phaser.Input.Keyboard.KeyCodes.LEFT,
            right: Phaser.Input.Keyboard.KeyCodes.RIGHT
        });

        //керування пальцем по єкрану
        this.touchVector = null;

        this.input.on('pointerdown', (pointer) => {
            this.touchVector = { x: pointer.x, y: pointer.y };
        });

        this.input.on('pointermove', (pointer) => {
            if (this.touchVector) {
                this.touchVector = {
                    x: pointer.x - this.player.x,
                    y: pointer.y - this.player.y
                };
            }
        });

        this.input.on('pointerup', () => {
            this.touchVector = null;
        });
        
    }

    generateMaze(cols, rows) {
        let maze = Array(rows).fill().map(() => Array(cols).fill(1)); // Заповнюємо стіни

        //console.log(maze);
        let stack = [];
        let currentCell = { x: 0, y: 1};
        
        maze[currentCell.y][currentCell.x] = 0; // точка входу
        maze[rows - 2][cols - 2] = 2; // двері
        stack.push(currentCell);
        
        while (stack.length > 0) {
            let neighbors = this.getValidNeighbors(currentCell, maze);

            if (neighbors.length > 0) {
                
                let nextCell = Phaser.Utils.Array.GetRandom(neighbors);

                maze[nextCell.y][nextCell.x] = 0;
                maze[(currentCell.y + nextCell.y) / 2][(currentCell.x + nextCell.x) / 2] = 0;
                stack.push(nextCell);
                currentCell = nextCell;
            } else {
                currentCell = stack.pop();
            }
        }

        // Додаємо два ключі в лабіринт
        let keysPlaced = 0;
        let keynum = 2;

        while (keysPlaced < keynum) {
            let keyX = Phaser.Math.Between(1, cols - 2);
            let keyY = Phaser.Math.Between(1, rows - 2);

            // Ставимо ключ лише у прохідну клітинку (0), щоб не зіпсувати стіну
            if (maze[keyY][keyX] === 0) {
                maze[keyY][keyX] = 3; // 3 — ключ
                keysPlaced++;
            }
        }

        return maze;
    }

    getValidNeighbors(cell, maze) {
        let { x, y } = cell;
        let directions = [
            { x: 2, y: 0 }, { x: -2, y: 0 },
            { x: 0, y: 2 }, { x: 0, y: -2 }
        ];
        
        return directions
            .map(d => ({ x: x + d.x, y: y + d.y }))
            .filter(n => n.x > 0 && n.x < this.cols - 1 && n.y > 0 && n.y < this.rows - 1 && maze[n.y][n.x] === 1);
    }
    

    drawMaze() {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.grid[y][x] === 1) {
                    // Тень
                    let shadow = this.add.image(
                        x * this.cellSize + this.cellSize / 2, // смещение тени по оси X
                        y * this.cellSize + this.cellSize / 2 + 10, // смещение тени по оси Y
                        'wallTexture'
                    )
                    .setDisplaySize(this.cellSize, this.cellSize)
                    .setAlpha(0.8); // полупрозрачная тень
                    shadow.setTint(0x409459);
                    shadow.setPipeline('Light2D');
    
                    // Основное изображение
                    const wall = this.add.sprite(
                        x * this.cellSize + this.cellSize / 2,
                        y * this.cellSize + this.cellSize / 2,
                        'wallTexture'
                    ).setDisplaySize(this.cellSize, this.cellSize);
                    //wall.setTint(0x00FF11); 
                    wall.setPipeline('Light2D');
                    //wall.setNormalMap('wallTexture_n');
                }

                if (this.grid[y][x] === 2) {

                    const door = this.add.image(
                        x * this.cellSize + this.cellSize / 2,
                        y * this.cellSize + this.cellSize / 2,
                        'door'
                    ).setDisplaySize(this.cellSize, this.cellSize);
                    door.setTint(0x868686).setPipeline('Light2D');

                } 
                if (this.grid[y][x] === 3) {

                    const key = this.add.image(
                        x * this.cellSize + this.cellSize / 2,
                        y * this.cellSize + this.cellSize / 2,
                        'key'
                    ).setDisplaySize(this.cellSize, this.cellSize);
                    this.keySprites.push({sprite: key, y, x});

                    let bright = true;
                    
                    // Анімація яскравості через зміну tint
                    this.time.addEvent({
                        delay: 800,
                        loop: true,
                        callback: () => {
                            if (bright) {
                                key.setTint(0xffff66); // Яскравіший (жовтий блиск)
                            } else {
                                key.setTint(0xffcc00); // Темніший
                            }
                            bright = !bright;
                        }
                    });

                }
            }
        }
    }

    update(){
        
        let moveX = 0, moveY = 0;
        this.SoundSettings = { volume: volumeLevel, rate: 1.2, seek: 0.5 };
        //для миготіння фонарика
        this.flickerTime += 0.1;
        const flicker = 1.8 + Math.sin(this.flickerTime) * 0.2;
        this.playerLight.setIntensity(flicker);
        //анімація туману
        this.fog.tilePositionX += 0.1;
        this.fog.tilePositionY += 0.05;

        if (this.pause == false){
            
            if (this.keybtn.down.isDown) {
                moveY = 4;

                if (!this.stepSound.isPlaying){
                    this.stepSound.play(this.SoundSettings);
                }
      
                this.player.play('walk', true); // Запускаем анимацию
                this.player.setRotation(Phaser.Math.DegToRad(90)); // Поворот вниз
                this.playerFeet.play('feetmove', true);
                this.playerFeet.setRotation(Phaser.Math.DegToRad(90));
                this.glowEffect.setPosition(this.player.x, this.player.y + 55);
                this.glowEffect.setRotation(Phaser.Math.DegToRad(0));
                
            } else if (this.keybtn.up.isDown) {
                moveY = -4;
                
                if (!this.stepSound.isPlaying){
                    this.stepSound.play(this.SoundSettings);
                }

                this.player.play('walk', true); // Запускаем анимацию
                this.player.setRotation(Phaser.Math.DegToRad(-90)); // Поворот вверх
                this.playerFeet.play('feetmove', true);
                this.playerFeet.setRotation(Phaser.Math.DegToRad(-90));
                this.glowEffect.setPosition(this.player.x, this.player.y - 55);
                this.glowEffect.setRotation(Phaser.Math.DegToRad(180));
            }
        
            // Двигаем персонажа по X
            if (this.keybtn.right.isDown) {
                moveX = 4;

                if (!this.stepSound.isPlaying){
                    this.stepSound.play(this.SoundSettings);
                }
                
                this.player.play('walk', true); // Запускаем анимацию
                this.player.setRotation(Phaser.Math.DegToRad(0)); // Поворот вправо
                this.playerFeet.play('feetmove', true);
                this.playerFeet.setRotation(Phaser.Math.DegToRad(0));
                this.glowEffect.setPosition(this.player.x + 55, this.player.y);
                this.glowEffect.setRotation(Phaser.Math.DegToRad(-90));
            } else if (this.keybtn.left.isDown) {
                moveX = -4;

                if (!this.stepSound.isPlaying){
                    this.stepSound.play(this.SoundSettings);
                }
                
                this.player.play('walk', true); // Запускаем анимацию
                this.player.setRotation(Phaser.Math.DegToRad(180)); // Поворот влево
                this.playerFeet.play('feetmove', true);
                this.playerFeet.setRotation(Phaser.Math.DegToRad(180));
                this.glowEffect.setPosition(this.player.x - 55, this.player.y);
                this.glowEffect.setRotation(Phaser.Math.DegToRad(90));
            }
            // тут треба реалізувати тач керування
            // let moveX = 0;
            // let moveY = 0;

            if (this.touchVector) {
                const angle = Math.atan2(this.touchVector.y, this.touchVector.x);
                const speed = 4;

                moveX = Math.cos(angle) * speed;
                moveY = Math.sin(angle) * speed;

                // this.player.x += moveX;
                // this.player.y += moveY;
                // this.playerFeet.x += moveX;
                // this.playerFeet.y += moveY;
                // this.glowEffect.x += moveX;
                // this.glowEffect.y += moveY;

                this.player.rotation = angle;
                this.playerFeet.rotation = angle;

                // орієнтація світла
                const offset = 55;
                this.glowEffect.setPosition(
                    this.player.x + Math.cos(angle) * offset,
                    this.player.y + Math.sin(angle) * offset
                );
                this.glowEffect.setRotation(angle + Phaser.Math.DegToRad(270));

                this.player.play('walk', true);
                this.playerFeet.play('feetmove', true);

                if (!this.stepSound.isPlaying) {
                    this.stepSound.play(this.SoundSettings);
                }
            } else {
                // зупинка анімації коли немає дотику
                this.player.anims.stop();
                this.playerFeet.anims.stop();
                this.stepSound.stop();
            }

            
        } 
    
        // Остановка анимации, если персонаж не двигается
        if (moveX === 0 && moveY === 0) {
            this.player.play('idle', true);
            //this.player.stop(); // Останавливаем анимацию, если нет движения
            this.playerFeet.stop();
            this.stepSound.stop();
        }
        
        let newX = this.player.x + moveX;
        let newY = this.player.y + moveY;
       
        this.playerLight.x = this.player.x;
        this.playerLight.y = this.player.y;

        if (this.checkCollision(newX, newY)) {
            this.player.x = newX;
            this.player.y = newY;
            this.playerFeet.x = newX;
            this.playerFeet.y = newY;
        }
      
    }
    
    
    // Проверка, можно ли идти на новую клетку (коллизия)
    checkCollision(x, y) {
        let halfSize = this.cellSize / 6; // Радиус игрока (он же круг)
        
        // Координаты четырёх точек вокруг игрока
        let checkPoints = [
            { x: x - halfSize, y: y - halfSize }, // Верхний левый угол
            { x: x + halfSize, y: y - halfSize }, // Верхний правый угол
            { x: x - halfSize, y: y + halfSize }, // Нижний левый угол
            { x: x + halfSize, y: y + halfSize }  // Нижний правый угол
        ];
    
        // Проверяем, находятся ли все эти точки в проходимых клетках
        return checkPoints.every(point => {
            let gridX = Math.floor(point.x / this.cellSize);
            let gridY = Math.floor(point.y / this.cellSize);
            
            if (this.grid[gridY] && this.grid[gridY][gridX]===2 ){
                if (this.countKes === 2){
                    this.stepSound.stop();
                    this.lesSound.stop();
                    this.scene.start('WinScene');
                }else {this.closeDorSound.play({volume: volumeLevel});}

            }
            if (this.grid[gridY] && this.grid[gridY][gridX]===3){
                
                this.grid[gridY][gridX] = 0;
                const keyObj = this.keySprites.find(key => key.x === gridX && key.y === gridY);
                if (keyObj) {
                    keyObj.sprite.destroy();
                }
                this.countKes++;
                this.upkeySound.play({volume: volumeLevel});
                this.forUpdateCountKeys.setText(this.countKes + "/2");
            }
            else return this.grid[gridY] && this.grid[gridY][gridX] === 0;

           
        });
    }

    pauseGame(){
            this.lesSound.stop();
            if (this.pause == false){
                this.menuBackground = this.add.image(this.scale.width / 3, this.scale.height / 4.4, 'backgroundPause')
                //.setAlpha(0.7)
                .setOrigin(0, 0)        
                .setScrollFactor(0)
                .setScale(this.cellSize / 80);

            }

            this.btnContinue = this.add.image(this.scale.width / 2.2, this.scale.height / 3.3, 'btnContinue')
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setScale(this.cellSize / 110)
            .setInteractive()
            .on('pointerover', function () {this.setTint(0xB8860B);})
            .on('pointerout',  function () {this.clearTint();})
            .on('pointerdown', () => {
                this.menuBackground.destroy();
                this.btnContinue.destroy();
                this.btnOptions.destroy();
                this.btnExitPause.destroy();
                this.btnMiniOptions.setInteractive();
                this.btnMiniOptions.clearTint();
                this.lesSound.play({volume: volumeLevel, seek: 1});
                this.pause = false;
            });
            
            this.btnOptions = this.add.image(this.scale.width / 2.17, this.scale.height / 2.4, 'btnOptions')
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setScale(this.cellSize / 80)
            .setInteractive()
            .on('pointerover', function () {this.setTint(0xB8860B);})
            .on('pointerout',  function () {this.clearTint();})
            .on('pointerdown', () => {
                this.btnContinue.destroy();
                this.btnOptions.destroy();
                this.btnExitPause.destroy();
                this.pauseOptions();
            });
            this.btnExitPause = this.add.image(this.scale.width / 2.15, this.scale.height / 1.95, 'BtnExitPause')
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setScale(this.cellSize / 90)
            .setInteractive()
            .on('pointerover', function () {this.setTint(0xB8860B);})
            .on('pointerout',  function () {this.clearTint();})
            .on('pointerdown', () => {
                this.btnExitPause.destroy();
                this.menuBackground.destroy();
                this.btnContinue.destroy();
                this.btnOptions.destroy();
                this.btnMiniOptions.setInteractive();
                this.btnMiniOptions.clearTint();
                this.pause = false;
                numlvl = 1;
                lvlsizeX = 10; 
                lvlsizeY = 10;
                this.scene.start('MenuScene');
            });
            
    }; 

    createVolumeSlider(sliderLineX, sliderLineY, setSliderThumbX, sliderThumbY, imgX, imgY, img){

        this.imgSoundEffects = this.add.image(imgX, imgY, img)
            .setScrollFactor(0)
            .setScale(this.cellSize / 80)

        this.sliderLine = this.add.rectangle(sliderLineX, sliderLineY, 200, 5, 0xffffff)
            .setScrollFactor(0)
            .setAlpha(0.5)

        this.jetSliderThumb = this.add.circle(setSliderThumbX, sliderThumbY, 6, 0x7FFFD4)
            .setScrollFactor(0)
            .setAlpha(0.8)
            .setInteractive();

        this.input.setDraggable(this.jetSliderThumb);
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            // Обмежуємо рух тільки по осі X у межах слайдера
            const minX = this.sliderLine.x - this.sliderLine.width / 2;
            const maxX = this.sliderLine.x + this.sliderLine.width / 2;
    
            gameObject.x = Phaser.Math.Clamp(dragX, minX, maxX);
    
            // Вираховуємо нову гучність (0 - 1)
            const newVolume = (gameObject.x - minX) / this.sliderLine.width;
            volumeLevel = newVolume;
        });

    }
    
    pauseOptions(){
        if (sliderThumbX == 0){sliderThumbX = firstPosTramble};
        this.createVolumeSlider(this.scale.width / 2, this.scale.height / 2.5, sliderThumbX, this.scale.height / 2.5, this.scale.width / 2, this.scale.height / 2.8, 'imgSoundEffects');

        this.btnArrowBack = this.add.image(this.scale.width / 2.7, this.scale.height / 3.6, 'btnArrowBack')
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setScale(this.cellSize / 80)
            .setInteractive()
            .on('pointerover', function () {this.setTint(0xB8860B);})
            .on('pointerout',  function () {this.clearTint();})
            .on('pointerdown', () => {
                this.btnArrowBack.destroy();
                this.sliderLine.destroy();
                sliderThumbX = this.jetSliderThumb.x;
                this.jetSliderThumb.destroy();
                this.imgSoundEffects.destroy();
                this.btnFullScreen.destroy();
                this.forbtnFullScreen.destroy();
                this.pauseGame();
            });
        //btnFullScreen

        this.btnFullScreen = this.add.image(this.scale.width / 2.2, this.scale.height / 2, 'btnFullScreen')
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setScale(this.cellSize / 80)
            .setInteractive()
            .on('pointerover', function () {this.setTint(0xB8860B);})
            .on('pointerout',  function () {this.clearTint();})
            .on('pointerdown', () => {
                if (this.scale.isFullscreen) {
                    this.scale.stopFullscreen(); 
                } else {
                    this.scale.startFullscreen(); 
                }   
            });
        this.forbtnFullScreen = this.add.text(this.scale.width / 1.95, this.scale.height / 1.94, textOFForON, {
            fontSize: '24px',
            color: '#000000',
            fontFamily: 'Inknut Antiqua',
            align: 'center'
        }).setOrigin(0.5) 
            .setScrollFactor(0)
            .setScale(this.cellSize / 100);
        
    }
}



class WinScene extends Phaser.Scene {
    constructor() {
        super('WinScene');
    }

    preload(){

        this.load.image('backgroundGameWin', 'assets/backgroundGameWin.png');
        this.load.image('btnExit', 'assets/HUD/btnExit.png');
        this.load.image('btnTryAgain', 'assets/HUD/btnTryAgain.png');
        this.load.image('btnNextLvl', 'assets/HUD/btnNextLvl.png');
    
    }

    create(){

        this.add.image(this.scale.width / 2, this.scale.height / 2, 'backgroundGameWin')
            .setDisplaySize(1280, 720);
        
        this.add.text(this.scale.width / 2.2, this.scale.height / 2.65, numlvl, {
            fontSize: '24px',
            color: '#000000',
            fontFamily: 'Inknut Antiqua',
            align: 'center'
        }).setOrigin(0.5) 
            .setScale(1);

        let btnNextLvl = this.add.image(this.scale.width / 2, this.scale.height / 1.5, 'btnNextLvl')
            .setInteractive()
            .setScale(0.5);

        let btnExit = this.add.image(this.scale.width / 3, this.scale.height / 1.3, 'btnExit')
            .setInteractive()
            .setScale(0.5);

        let btnTryAgain = this.add.image(this.scale.width / 1.46, this.scale.height / 1.3, 'btnTryAgain')
            .setInteractive()
            .setScale(0.5);
        
        addButtonEffects(btnNextLvl);
        addButtonEffects(btnExit);
        addButtonEffects(btnTryAgain);

        btnExit.on('pointerdown', () => {
            numlvl = 1;
            lvlsizeX = 10; 
            lvlsizeY = 10;
            this.scene.start('MenuScene');
        });
        btnTryAgain.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        btnNextLvl.on('pointerdown', () => {
            numlvl++;
            lvlsizeX += 10; 
            lvlsizeY += 10;
            this.scene.start('GameScene');
        });
    }
}

const config = {
    type: Phaser.WEBGL,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1280,
        height: 720
    },
    scene: [MenuScene, GameScene, WinScene]

};

const game = new Phaser.Game(config);


function addButtonEffects(button) {
    button.on('pointerover', () => button.setScale(0.6).setTint(0xB8860B));
    button.on('pointerout', () => button.setScale(0.5).clearTint());
    button.on('pointerdown', () => button.setScale(0.5).setTint(0x008000));
}
