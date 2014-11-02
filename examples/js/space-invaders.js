
var SpaceInvaders = function(selector, mode, rows, cols, hSteps, vSteps, bulletsNumber)
{
    var game = this,
        $game = $(selector);
            
    $game.html('<ul class="object aliens"></ul>' +
        '<div class="object defender"></div>' +
        '<div class="controls"><span class="left">‹</span><span class="space">fire</span><span class="right">›</span></div>' +
        '<div class="object win">you win</div>' +
        '<div class="object lose">defeat</div>' +
        '<div class="object restart">restart</div>' + 
        '<div class="object invader"></div>'
    ).removeClass('auto manual').addClass(mode);


    var $aliens = $game.find('.aliens'),
        $defender = $game.find('.defender'),
        $win = $game.find('.win'),
        $lose = $game.find('.lose'),
        $restart = $game.find('.restart'),
        $invader = $game.find('.invader'),
        $restart = $game.find('.restart'), 
        $controls = $game.find('.controls'),
        bullets = [], bulletsCount = 0, bulletOffsetH, bulletOffsetV,
        invaderHeight = $invader.css('height'),
        aliens, defender,
        endTimeline,
        isManual = mode == 'manual',
        currentDriver = Tweene.defaultDriver, 
        enabled = false,
        width = $game.innerWidth(),
        height = $game.find('.defender').position().top - $game.find('.aliens').position().top - 5;
        
    
    aliens = {
        timeline: null,
        hStep: 0, 
        vStep: 0,        
        delay: 1,
        duration: 0.5,
        speed: 1,
        x: 0, 
        y: 0, 
        fakeX: 0, 
        fakeY: 0,
        elements: [],
        count: 0,
        elementWidth: 0, 
        elementHeight: 0, 
        marginH: 0, 
        marginV: 0,
        offsetH: 0,
        offsetV: 0,
        currentWidth: 0,
        currentHeight: 0,
        currentDir: 0,
        beginX: 0, 
        endX: 0, 
        beginY: 0, 
        endY: 0,
        currentX: 0,
        currentY: 0,
        rows: [],
        cols: [],

        
        init: function()
        {
            var i, j, aliensHtml = '', $first, pos;

            for(i = 0; i < rows; i++)    
            {
                aliensHtml += '<li class="row"><ul class="cols">';
                this.elements[i] = [];

                for(j = 0; j < cols; j++)
                {
                    aliensHtml += '<li class="col"><div class="object alien"></div></li>';            
                    this.elements[i][j] = [true, null];
                }

                aliensHtml += '</ul></li>';
            }
            $aliens.html(aliensHtml);

            $first = $aliens.find('.alien').first();
            this.elementWidth = parseFloat($first.width());
            this.elementHeight = parseFloat($first.height());
            this.marginH = Math.floor((width - ((cols + hSteps) * this.elementWidth)) / (cols + hSteps - 1));
            this.marginV = Math.floor((height - ((rows + vSteps) * this.elementHeight)) / (rows + vSteps - 1));
            $aliens.find('.col').css('margin-right', this.marginH + 'px');
            $aliens.find('.row').css('margin-bottom', this.marginV + 'px');            
            this.currentWidth = (this.elementWidth * cols) + (this.marginH * (cols - 1));
            this.currentHeight = (this.elementHeight * rows) + (this.marginV * (rows - 1));
            $aliens.css({width: 'auto', height: 'auto'});
            this.hStep = this.elementWidth + this.marginH;
            this.vStep = this.elementHeight + this.marginV;
            
            return this;            
        },
        
        
        reset: function()
        {
            this.stop();
            this.speed = 1;
            this.count = rows * cols;
            Tweene.set($aliens, {display: 'block', x: 0, y: 0});
            this.x = this.y = 0;
            this.currentDir = 1;
            this.currentX = this.currentY = this.beginX = this.beginY = 0;
            this.endX = hSteps;
            this.endY = vSteps;
            this.firstX = 0;
            this.lastX = cols - 1;
            this.firstY = 0;
            this.lastY = rows - 1;

            for(var i = 0; i < rows; i++)
            {
                this.rows[i] = cols;
                for(var j = 0; j < cols; j++)
                {
                    if(this.elements[i][j][1])
                    {
                        this.elements[i][j][1].pause();
                    }
                    this.elements[i][j] = [true, null];
                    this.cols[j] = rows;
                }
            }
            // force a change because when swapping a driver the new one don't know about previously applied transformation by other drivers
            Tweene.set($aliens.find('.alien'), {rotate: 0.1, scale: 1.1});
            Tweene.set($aliens.find('.alien'), {rotate: 0, scale: 1, opacity: 1});
            return this;            
        },
        
        
        start: function()
        {
            this.move(1);
        },
        
        
        stop: function()
        {
            if(this.timeline)
            {
                this.timeline.pause();
            }
            for(var i = 0; i < rows; i++)
            {
                for(var j = 0; j < cols; j++)
                {
                    if(this.elements[i][j][1] !== null)
                    {
                        this.elements[i][j][1].pause();
                    }
                }
            }
            return this;
        },
        
        
        move: function(dir)
        {
            if(!enabled)
            {
                return this;
            }
            var self = this, dest = {}, target, step, newValue, sign, inc, check;
            
            switch(dir)
            {
                case -1:
                    target = 'x';
                    step = this.hStep;
                    newValue = -step;
                    sign = dir;
                    inc = 'currentX';
                    check = 'beginX';                                        
                break;
                
                case 1:
                    target = 'x';
                    step = this.hStep;
                    newValue = step;
                    sign = dir;
                    inc = 'currentX';
                    check = 'endX';                    
                break;
                
                case 0:
                    target = 'y';
                    step = this.vStep;
                    newValue = step;
                    sign = 1;
                    inc = 'currentY';
                    check = 'endY';                                        
                break;
            }

            dest[target] = '+=' + newValue;            
            var prev = 0 + this[target];
            
            this.timeline = Tweene.get($aliens)
                .to(dest)
                .easing('linear')
                .delay(this.delay / this.speed)
                .duration(this.duration / this.speed)
                .on('progress', function(){
                    self[target] = step * this.progress() * sign + prev;
                })
                .on('end', function() { 
                    self[target] = step * this.progress() * sign + prev;
                    self[inc] += sign;
                    switch(dir)
                    {
                        case -1:
                            if(self[inc] > self[check])
                            {
                                self.move(dir);
                            }
                            else
                            {
                                self.currentDir *= -1;
                                self.move(0);
                            }
                        break;
                        
                        case 1:
                            if(self[inc] < self[check])
                            {
                                self.move(dir);
                            }
                            else
                            {
                                self.currentDir *= -1;
                                self.move(0);
                            }
                        break;
                        
                        case 0: 
                            if(self[inc] < self[check])
                            {
                                self.move(self.currentDir);
                            }
                            else
                            {
                                game.lose();
                            }
                        break;
                    }
                })
                .play()
            ;
            
        },
        
        
        
        hit: function(bulletX, bulletY)
        {
            if(bulletY > this.y && bulletY < this.y + this.currentHeight && bulletX > this.x)
            {
                var left, right, top, bottom;
                var bulletLeft = bulletX - 3, bulletRight = bulletX + 3, bulletTop = bulletY - 3, bulletBottom = bulletY + 3;
                for(var i = 0; i < rows; i++)    
                {
                    for(var j = 0; j < cols; j++)
                    {
                        if(this.elements[i][j][0])
                        {
                            left = ((this.elementWidth + this.marginH) * j) + this.x;
                            right = left + this.elementWidth;
                            top = ((this.elementHeight + this.marginV) * i) + this.y;
                            bottom = top + + this.elementHeight;
                            if(bulletLeft < right && bulletRight > left && bulletTop < bottom && bulletBottom > top)
                            {
                                this.elements[i][j][0] = false;
                                this.rows[i] --;
                                this.cols[j] --;
                                this.explode(i, j);
                                while(this.rows[i] === 0 && this.lastY == i && i > 0)
                                {
                                    i --;
                                    this.lastY --;
                                    this.endY ++;
                                }

                                while(this.cols[j] === 0 && this.lastX == j && j > 0)
                                {
                                    j --;
                                    this.lastX --;
                                    this.endX ++;
                                }
                                while(this.cols[j] === 0 && this.firstX == j && j < cols)
                                {
                                    j ++;
                                    this.firstX ++;
                                    this.beginX --;
                                }

                                return true;
                            }
                        }
                    }
                }
            }
            return false;
        },
        
        
        explode: function(row, col)
        {
            var self = this;
            this.count --;
            if(!self.count)
            {
                enabled = false;
            }
            this.elements[row][col][1] = Tweene.get($aliens.find('.row').eq(row).find('.alien').eq(col))
                .to({rotate: '-270deg', scale: 1.5, opacity: 0})
                .duration(0.6)
                .on('complete', function(){
                    if(!self.count)
                    {
                        game.win();
                    }
                    else
                    {
                        var total = rows * cols;
                        var ratio = self.count / total;
                        if(ratio <= 0.34)
                        {
                            self.speed = 3.5;
                        }
                        else if(ratio <= 0.67)
                        {
                            self.speed = 2.5;
                        }                        
                    }
                })
                .play();
        }                
        
    };
    
    
    defender = {
        timeline: null,
        width: width - ($defender.position().left * 2) - $defender.width(),
        duration: 1,
        started: false,
        demoTimeout: null, 
        shotTimeout: null,
        
        
        reset: function()
        {
            this.stop();
            Tweene.set($defender, {display: 'block', x: 0});    
            this.timeline = Tweene.get($defender)
                .from({x: 0})
                .to({x: this.width})
                .duration(this.duration)
                .easing('linear');                        
            
            return this;            
        },
        
        
        start: function()
        {
            if(!isManual)
            {
                var self = this;
                var duration = this.duration * 1000;
                var demoStep = function()
                {
                    var action = (self.timeline.progress() > 0.5)? 'reverse' : 'play';
                    self.timeline[action]();
                    if(enabled)
                    {
                        self.demoTimeout = setTimeout(function() {
                            if(enabled)
                            {
                                setTimeout(demoStep, Math.random() * duration);
                            }
                        }, Math.random() * duration / 1.5);
                    }
                };

                var demoShot = function()
                {
                    if(enabled)
                    {
                        shot();
                        self.shotTimeout = setTimeout(demoShot, 400 + Math.random() * duration * 0.8);
                    }
                };
                
                this.timeline.play();
                this.demoTimeout = setTimeout(demoStep, Math.random() * duration);
                this.shotTimeout = setTimeout(demoShot, 400 + Math.random() * duration * 0.8);
            }
            
            return this;
        },
        
        
                
        stop: function()
        {
            if(this.timeline)
            {
                this.timeline.pause();
            }
            if(!isManual)
            {
                if(this.demoTimeout)
                {
                    clearTimeout(this.demoTimeout);
                    this.demoTimeout = null;
                }
                if(this.shotTimeout)
                {
                    clearTimeout(this.shotTimeout);
                    this.shotTimeout = null;
                }
            }
            return this;
        },                
        
        
        hide: function()
        {
            this.stop();
            Tweene.set($defender, {display: 'none'});
            return this;
        },
        
        
        move: function(dir)
        {
            if(enabled && isManual)
            {
                var action = dir == 'left'? 'reverse' : 'play';
                this.timeline[action]();
            }
            return this;
        }                      
        
    };
    
    aliens.init();
    
    
    var Bullet = function(id, staticPos, callback)
    {
        var duration = 2,
            $bullet = $('<div class="object spaceball"></div>'),
            tween = null
        ;

        $game.append($bullet);            
        if(id === 0)
        {
            var pos = $bullet.position();
            bulletOffsetH = pos.left;
            bulletOffsetV = pos.top;            
        }
        
        

        this.reset = function()
        {
            this.stop();
            Tweene.set($bullet, {display: 'block', x: staticPos, y: 38});            
            return this;
        };


        this.shot = function(x)
        {
            if(tween && !tween.paused())
            {
                tween.pause();
            }
            
            tween = Tweene.get($bullet)
                .from({x: x, y: 0})
                .to({x: x, y: -height - 10})
                .duration(duration)
                .easing('linear')
                .on('progress', callback, [x, id])
                .play();
        };

        this.stop = function()
        {
            if(tween)
            {
                tween.pause();
                Tweene.set($bullet, {y: -height - 10});
            }
        };



    };
    
    
    var checkShot = function(x, i)
    {
        x += bulletOffsetH; 
        var y = bulletOffsetV - (this.progress() * (height + 10));
        if(aliens.hit(x, y))
        {
            bullets[i].stop();
        }
        
    };
    
    
    var bulletStep = defender.width / (bulletsNumber - 1);
    for(var i = 0; i < bulletsNumber; i++)
    {
        bullets[i] = new Bullet(i, defender.width - (bulletStep * i), checkShot);
    }
    
    
    var shot = function()
    {
        if(enabled && (!isManual || bulletsCount < bulletsNumber))
        {
            bullets[(bulletsCount ++) % bulletsNumber].shot(defender.timeline.progress() * defender.width);
        }            
        
    };
    
    
    if(isManual)
    {
        $(document).on('keydown', function(event){     

            var isCommand = false;

            switch(event.which)
            {
                case 32: // space
                    shot();
                    isCommand = true;
                break;

                case 37: // left
                    isCommand = true;
                    defender.move('left');
                break;

                case 39: // right
                    isCommand = true;
                    defender.move('right');
               break;
            }

            if(isCommand)
            {
                event.preventDefault();
                event.stopPropagation();
            }
        });

        $game.find('.left').on('click touchstart', function(event){
            defender.move('left');
            event.preventDefault();
            event.stopPropagation();
        });

        $game.find('.right').on('click touchstart', function(event){
            defender.move('right');
            event.preventDefault();
            event.stopPropagation();
        });

        $game.find('.space').on('click touchstart', function(event){
            shot();
            event.preventDefault();
            event.stopPropagation();
        });
        
        
        $restart.on('click', function(event){
            game.restart(currentDriver);
            event.preventDefault();
            event.stopPropagation();
        });        
    }

    
    
    var reset = function()
    {
        enabled = true;
        if(endTimeline)
        {
            endTimeline.pause();
        }
        defender.reset();
        Tweene.set($win, {display: 'none'});
        Tweene.set($lose, {display: 'none'});        
        Tweene.set($restart, {display: 'none'});  
        Tweene.set($invader, {top: '-' + invaderHeight, display: 'none'});
        if(isManual)
        {
            Tweene.set($controls, {display: 'block'});  
        }
        for(var i = 0; i < bulletsNumber; i++)
        {
            bullets[i].reset();
        }
        bulletsCount = 0;
        aliens.reset();
    };
    

    var endGame = function()
    {
        enabled = false;
        if(endTimeline)
        {
            endTimeline.pause();
        }
        Tweene.set($controls, {display: 'none'});
        Tweene.set($aliens, {display: 'none'});
        Tweene.set($defender, {display: 'none'});
        Tweene.set($game.find('.spaceball'), {display: 'none'});
        Tweene.set($invader, {top: '-' + invaderHeight});        
        aliens.stop();
        defender.stop();
        
    };
    
    
    this.win = function()
    {
        endGame();
        $win.css('display', 'none');
        
        endTimeline = Tweene.line()
            .set($win, {scale: 0.1, display: 'none'})
            .to($win, {display: 'block', scale: 0.8}, 0.6)
            .to($win, {scale: 1}, 1.2);
        
        if(!isManual)
        {
            endTimeline.add(this.restart, '+=1.2', [currentDriver], this);
        }
        else
        {
            endTimeline.fromTo($restart, {opacity: 0}, {display: 'block', opacity: 1}, 0.4);
        }
        endTimeline.play();
    };


    
    this.lose = function()
    {
        endGame();
        endTimeline = Tweene.line()
            .set($lose, {scale: 0.1, display: 'none'})
            .to($lose, {display: 'block', scale: 0.7}, 0.6)
            .to($lose, {scale: 1}, 1.2)
            .fromTo($invader, {top: '-' + invaderHeight}, {top: '10%', display: 'block'}, 1.8, 0)
            .to($invader, {y: -20}, 0.1, '+=0.2')
            .to($invader, {y: 0}, 0.1)
            .to($invader, {y: -20}, 0.1)
            .to($invader, {y: 0}, 0.1)
            .to($invader, {y: -20}, 0.1)
            .to($invader, {y: 0}, 0.1);
        
        if(!isManual)
        {
            endTimeline.add(this.restart, '+=1.2', [currentDriver], this);
        }
        else
        {
            endTimeline.fromTo($restart, {opacity: 0}, {display: 'block', opacity: 1}, 0.4);
        }
        
        endTimeline.play();
    };
    
                      
    
    this.restart = function(driver)
    {
        if(driver)
        {
            currentDriver = driver;
            Tweene.defaultDriver = driver;
        }

        reset();
        aliens.start(); 
        defender.start();
    };        
    
};
