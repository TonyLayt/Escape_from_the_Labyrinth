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
        let buttonSpacing = 100;

        this.add.image(centerX, centerY, 'backgroundMain');
            

        let startButton = this.add.image(centerX, centerY - buttonSpacing, 'StartButton')
            .setInteractive()
            .setScale(0.5);

        addButtonEffects(startButton);

        
        let settingsButton = this.add.image(centerX, centerY, 'BtnOptions')
        .setInteractive()
        .setScale(0.5);

        addButtonEffects(settingsButton);

        startButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
    }
}

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
        this.load.image('backgroundGamePlace', 'assets/floor4.png');
        this.load.image('wallTexture', 'assets/foliage3.png');
        this.load.image ('door', 'assets/door.png');
        this.load.image('light', 'assets/light.png');
        this.load.image('backgroundPause', 'assets/HUD/BackMiniMenu.png');
        this.load.image('btnContinue', 'assets/HUD/btnContinue.png');
        this.load.image('btnOptions', 'assets/HUD/btnOptions.png');
        this.load.image('btnArrowBack', 'assets/HUD/arrowBack.png');
        this.load.image('imgSoundEffects', 'assets/HUD/SoundEffects.png');
        this.load.image('BtnExitPause', 'assets/HUD/btnExit2.png');
        this.load.audio('steps', 'assets/sounds/step.mp3');
        this.load.audio('les', 'assets/sounds/les.mp3');
        

    }
  
    create() {
        this.volumeLevel = 0.5;
        this.stepSound = this.sound.add('steps');
        this.lesSound = this.sound.add('les');
        this.lesSound.play({volume: this.volumeLevel});
        this.sliderThumbX = this.scale.width / 2;
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
        
        let lvlsizeX = 10; // Розмір лабіринту
        let lvlsizeY = 10;

        this.cols = Math.floor(this.scale.width / this.cellSize) + lvlsizeY;
        this.rows = Math.floor(this.scale.height / this.cellSize) + lvlsizeX;
         
        this.grid = this.generateMaze(this.cols, this.rows);
        
        // размер всей карти 
        let mapWidth = this.cellSize * this.cols;
        let mapHeight = this.cellSize * this.rows;

        let bgTilesX = Math.ceil(mapWidth / 409);
        let bgTilesY = Math.ceil(mapHeight / 409);


        //рисуем бек фон по всей области
        for (let countX = 0; countX < bgTilesX; countX++) {
            for (let countY = 0; countY < bgTilesY; countY++) {
                this.add.image(
                    countX * 409,
                    countY * 409,
                    'backgroundGamePlace'
                ).setOrigin(0, 0).setScale(0.4); 
            }
        }
        

        this.drawMaze();
   
        this.playerFeet = this.add.sprite(this.cellSize / 2, this.cellSize * 1.5);

        this.glowEffect = this.add.image(this.cellSize / 2 + 85, this.cellSize * 1.5, 'light');
        this.glowEffect.setScale(0.3); 
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

        this.btnMiniOptions = this.add.image(this.scale.width / 4.6, this.scale.height / 4.6, 'btnMiniOptions')
            .setAlpha(0.7)
            .setOrigin(0, 0)        // якорь в левом верхнем углу
            .setScrollFactor(0)
            .setScale(this.cellSize / 150)
            .setInteractive()
            .on('pointerover', function () {this.setTint(0xBDBDBD);})
            .on('pointerout', function () {this.clearTint();})
            .on('pointerdown', () => {this.pauseGame(); this.btnMiniOptions.disableInteractive(); this.pause = true;});

        this.keybtn = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.UP,
            down: Phaser.Input.Keyboard.KeyCodes.DOWN,
            left: Phaser.Input.Keyboard.KeyCodes.LEFT,
            right: Phaser.Input.Keyboard.KeyCodes.RIGHT
        });
    
    }

    generateMaze(cols, rows) {
        let maze = Array(rows).fill().map(() => Array(cols).fill(1)); // Заповнюємо стіни

        //console.log(maze);
        let stack = [];
        let currentCell = { x: 0, y: 1 };
        
        maze[currentCell.y][currentCell.x] = 0;
        maze[rows - 2][cols - 2] = 2;
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
                        y * this.cellSize + this.cellSize / 2 + 8, // смещение тени по оси Y
                        'wallTexture'
                    )
                    .setDisplaySize(this.cellSize, this.cellSize)
                    .setAlpha(0.5); // полупрозрачная тень
                    shadow.setTint(0x409459);
    
                    // Основное изображение
                    const wall = this.add.image(
                        x * this.cellSize + this.cellSize / 2,
                        y * this.cellSize + this.cellSize / 2,
                        'wallTexture'
                    ).setDisplaySize(this.cellSize, this.cellSize);
                    wall.setTint(0x00FF11);
                }

                if (this.grid[y][x] === 2) {

                    const door = this.add.image(
                        x * this.cellSize + this.cellSize / 2,
                        y * this.cellSize + this.cellSize / 2,
                        'door'
                    ).setDisplaySize(this.cellSize, this.cellSize);
                    door.setTint(0x868686);

                }
            }
        }
    }

    update(){
        
        let moveX = 0, moveY = 0;
        this.SoundSettings = { volume: this.volumeLevel, rate: 1.2, seek: 0.5 };

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
                this.glowEffect.setPosition(this.player.x, this.player.y + 85);
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
                this.glowEffect.setPosition(this.player.x, this.player.y - 85);
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
                this.glowEffect.setPosition(this.player.x + 85, this.player.y);
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
                this.glowEffect.setPosition(this.player.x - 85, this.player.y);
                this.glowEffect.setRotation(Phaser.Math.DegToRad(90));
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
        // Обновляем позицию круга для подсветки
        //this.glowEffect.setPosition(this.player.x + 25, this.player.y);

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
            
            if (this.grid[gridY] && this.grid[gridY][gridX]===2){
                
                this.stepSound.stop();
                this.lesSound.stop();
                this.scene.start('WinScene');

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
                this.lesSound.play({volume: this.volumeLevel, seek: 1});
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
                this.scene.start('MenuScene');
            });
            
    }; 

    createVolumeSlider(sliderLineX, sliderLineY, sliderThumbX, sliderThumbY, imgX, imgY, img){

        this.imgSoundEffects = this.add.image(imgX, imgY, img)
            .setScrollFactor(0)
            .setScale(this.cellSize / 80)

        this.sliderLine = this.add.rectangle(sliderLineX, sliderLineY, 200, 5, 0xffffff)
            .setScrollFactor(0)
            .setAlpha(0.5)

        this.sliderThumb = this.add.circle(sliderThumbX, sliderThumbY, 6, 0x7FFFD4)
            .setScrollFactor(0)
            .setAlpha(0.8)
            .setInteractive();

        this.input.setDraggable(this.sliderThumb);
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            // Обмежуємо рух тільки по осі X у межах слайдера
            const minX = this.sliderLine.x - this.sliderLine.width / 2;
            const maxX = this.sliderLine.x + this.sliderLine.width / 2;
    
            gameObject.x = Phaser.Math.Clamp(dragX, minX, maxX);
    
            // Вираховуємо нову гучність (0 - 1)
            const newVolume = (gameObject.x - minX) / this.sliderLine.width;
            this.volumeLevel = newVolume;
        });

    }
    
    pauseOptions(){
        
        this.createVolumeSlider(this.scale.width / 2, this.scale.height / 2.5, this.sliderThumbX, this.scale.height / 2.5, this.scale.width / 2, this.scale.height / 2.8, 'imgSoundEffects');

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
                this.sliderThumbX = this.sliderThumb.x;
                this.sliderThumb.destroy();
                this.imgSoundEffects.destroy()
                this.pauseGame();
            });
        
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

        let btnExit = this.add.image(this.scale.width / 3, this.scale.height / 1.3, 'btnExit')
        .setInteractive()
        .setScale(0.5);

        let btnTryAgain = this.add.image(this.scale.width / 1.46, this.scale.height / 1.3, 'btnTryAgain')
        .setInteractive()
        .setScale(0.5);

        addButtonEffects(btnExit);
        addButtonEffects(btnTryAgain);

        btnExit.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
        btnTryAgain.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
    }
}

const config = {
    type: Phaser.AUTO,
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

