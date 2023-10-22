let dirNoise;
let widthNoise;

function initObjNoise() {
    dirNoise = new NYNoiseSet(0.016, 0.024, 0.02);
    widthNoise = new NYNoiseSet(random(0.001, 0.006), random(0.001, 0.006), random(0.001, 0.006));
}
class Ribbon {
    constructor(_startX, _startY, _startWidth, _startDir, _startSpeed) {
        this.points = [];
        this.points.push(new NYFlowPoint(_startX, _startY, _startWidth, _startDir));

        this.x = _startX;
        this.y = _startY;
        this.nowDir = _startDir;
        this.startLife = random(2.0, 4.0);
        this.life = this.startLife;

        this.startIndex = 0;
        this.endIndex = 0;

        if (isBlack) {
            let briA = random(0, 80);
            let briB = random(0, 80);

            if(random() < 0.4)
                briA = 0;

            if(random() < 0.4)
                briB = 0;

            this.colorA = new NYColor(0, 0, briA);
            this.colorB = new NYColor(0, 0, briB);
        }
        else {
            let newHueA = processHue(mainHue + random(-hueRange, hueRange));
            let newHueB = processHue(mainHue + random(-hueRange, hueRange));

            let colorRandom = random(0, 1);
            if (colorRandom < 0.1) {
                newHueA = processHue(newHueA + 180);
                newHueB = processHue(newHueB + 180);
            }
            else if (colorRandom < 0.3) {
                newHueA = processHue(newHueA + 40);
                newHueB = processHue(newHueB + 40);
            }

            let newSatA = random(40, 80);
            let newSatB = random(40, 80);

            let newBriA = random(60, 100);
            let newBriB = random(60, 100);

            this.colorA = new NYColor(newHueA, newSatA, newBriA);
            this.colorB = new NYColor(newHueB, newSatB, newBriB);
        }

        this.startWidth = _startWidth;
        this.maxWidthRatio = random(2, 8);
        this.nowWidth = _startWidth;
        this.speed = _startSpeed;

        this.hornWidthRatio = random(0.2, 0.45);
        this.hornHeightRatio = random(0.1, 1.2);

        this.eyePaddingRatio = random(0.2, 0.8);
        this.eyeSizeX = random(0.05, 0.3);
        this.eyeSizeY = random(0.05, 0.3);
        this.eyeDistRatio = random(0.1, 0.6);

        let targetCurveSet = curveSets[int(random(0, curveSets.length))];
        this.curveIn = targetCurveSet.inCurve;
        this.curveOut = targetCurveSet.outCurve;
        this.mouthWidthRatio = random(0.3, 0.43);
        this.mouthHeightRatioA = random(0.0, 0.12);
        this.mouthHeightRatioB = random(0.2, 0.4);
        this.mouthPaddingY = random(0.1, 0.3);
        this.mouthType = int(random(0, 2));
        this.curvePointCount = 6;

        this.teethDist = random(0.05, 0.2);
        this.teethWidth = random(0.05, 0.2);
        this.teethHeight = random(0.1, 0.3);

        this.mouseForceApplyRatio = 0.0;
    }

    update() {
        this.life -= 0.03;
        let t = this.life / this.startLife;

        if (this.life > 0) {

            let nowSpeed = sin(radians(t * t * 180)) * this.speed;
            this.nowWidth = (this.maxWidthRatio * widthNoise.noise(this.x, this.y, frameCount) + 1) * this.startWidth;

            // let newDir = dirNoise.noise(this.x, this.y, frameCount) * 720;
            let dirNoiseValue = dirNoise.noise(this.x, this.y, frameCount);
            let dirRange = 360;
            let newDir = lerp(-dirRange, dirRange, dirNoiseValue);


            this.nowDir = lerp(this.nowDir, newDir, 0.06 * t);

            this.x += sin(radians(this.nowDir)) * nowSpeed;
            this.y += -cos(radians(this.nowDir)) * nowSpeed;

            if (isMouseOver) {
                let affectDist = min(width, height) * 0.36;
                let distToMouse = dist(this.x, this.y, mouseX, mouseY);
                if (distToMouse < affectDist) {
                    let forceDir = getAngle(mouseX, mouseY, this.x, this.y);
                    let closeRatio = inverseLerp(affectDist, 0, distToMouse);

                    this.mouseForceApplyRatio = lerp(this.mouseForceApplyRatio, closeRatio, 0.06);

                    let forcePower = lerp(0.0, 240.0, closeRatio) * t * this.mouseForceApplyRatio;
                    this.x += sin(radians(forceDir)) * forcePower;
                    this.y += -cos(radians(forceDir)) * forcePower * 0.6;
                }
            }

            this.points.push(new NYFlowPoint(this.x, this.y, this.nowWidth, this.nowDir));

            this.endIndex++;
        }

        if (t < 0.6) {
            this.startIndex++;
        }

        if (this.startIndex >= this.endIndex) {
            ribbons.splice(ribbons.indexOf(this), 1);
        }
    }

    draw() {
        if (this.life <= 0)
            return;

        let nowColor = NYLerpColor(this.colorB, this.colorA, this.life / this.startLife);
        let nowAlpha = min((this.startLife - this.life), 1.0);
        fill(nowColor.h, nowColor.s, nowColor.b, nowAlpha);
        beginShape();
        for (let i = this.startIndex; i <= this.endIndex; i++)
            vertex(this.points[i].leftPoint.x, this.points[i].leftPoint.y);

        for (let i = this.endIndex; i >= this.startIndex; i--)
            vertex(this.points[i].rightPoint.x, this.points[i].rightPoint.y);
        endShape();

        // draw face
        let nowHornWidth = this.nowWidth * this.hornWidthRatio;
        let nowHornPadding = this.nowWidth / 2 - nowHornWidth;
        let nowHornHeight = this.nowWidth * this.hornHeightRatio;
        let nowEyeSizeX = this.nowWidth * this.eyeSizeX;
        let nowEyeSizeY = this.nowWidth * this.eyeSizeY;
        let nowEyePosY = this.nowWidth * this.eyePaddingRatio + nowEyeSizeY / 2;
        let nowEyesDist = (this.nowWidth / 2 - nowEyeSizeX) * this.eyeDistRatio + nowEyeSizeX / 2;

        let nowMouthWidth = this.nowWidth * this.mouthWidthRatio;
        let nowMouthHeightA = this.nowWidth * this.mouthHeightRatioA;
        let nowMouthHeightB = this.nowWidth * this.mouthHeightRatioB;
        let nowMouthPaddingY = this.nowWidth * this.mouthPaddingY + nowEyePosY;

        let nowTeethDist = this.nowWidth * this.teethDist;
        let nowTeethWidth = this.nowWidth * this.teethWidth;
        let nowTeethHeight = this.nowWidth * this.teethHeight;

        push();
        translate(this.x, this.y);
        rotate(radians(this.nowDir));

        // horns
        triangle(-nowHornPadding, -nowHornHeight, -nowHornPadding, 0, -this.nowWidth / 2, 0);
        triangle(nowHornPadding, -nowHornHeight, nowHornPadding, 0, this.nowWidth / 2, 0);

        // eyes
        fill('white');
        ellipse(- nowEyesDist, nowEyePosY, nowEyeSizeX, nowEyeSizeY);
        ellipse(nowEyesDist, nowEyePosY, nowEyeSizeX, nowEyeSizeY);

        // mouth
        fill(nowColor.h, nowColor.s - 30, nowColor.b + 30, nowAlpha);
        beginShape();
        for (let i = 0; i < this.curvePointCount; i++) {
            let t = i / this.curvePointCount;
            let curveX = lerp(-nowMouthWidth, 0, t);
            let curveY = lerp(0, nowMouthHeightA, this.curveOut(t)) + nowMouthPaddingY;

            if (this.mouthType == 1)
                curveY = lerp(nowMouthHeightB, 0, this.curveOut(t)) + nowMouthPaddingY;
            vertex(curveX, curveY);
        }

        for (let i = 0; i < this.curvePointCount; i++) {
            let t = i / this.curvePointCount;
            let curveX = lerp(0, nowMouthWidth, t);
            let curveY = lerp(nowMouthHeightA, 0, this.curveIn(t)) + nowMouthPaddingY;

            if (this.mouthType == 1)
                curveY = lerp(0, nowMouthHeightB, this.curveIn(t)) + nowMouthPaddingY;

            vertex(curveX, curveY);
        }

        for (let i = 0; i < this.curvePointCount; i++) {
            let t = i / this.curvePointCount;
            let curveX = lerp(nowMouthWidth, 0, t);
            let curveY = lerp(0, nowMouthHeightB, this.curveOut(t)) + nowMouthPaddingY;

            if (this.mouthType == 1)
                curveY = lerp(nowMouthHeightB, nowMouthHeightB - nowMouthHeightA, this.curveOut(t)) + nowMouthPaddingY;

            vertex(curveX, curveY);
        }

        for (let i = 0; i < this.curvePointCount; i++) {
            let t = i / this.curvePointCount;

            let curveX = lerp(0, -nowMouthWidth, t);
            let curveY = lerp(nowMouthHeightB, 0, this.curveIn(t)) + nowMouthPaddingY;

            if (this.mouthType == 1)
                curveY = lerp(nowMouthHeightB - nowMouthHeightA, nowMouthHeightB, this.curveIn(t)) + nowMouthPaddingY;

            vertex(curveX, curveY);
        }
        endShape();

        // teeth
        let leftTeethX = -0.5 * nowTeethDist;
        let rightTeethX = 0.5 * nowTeethDist;

        fill(nowColor.h, nowColor.s, nowColor.b, nowAlpha);
        triangle(leftTeethX, nowMouthPaddingY, leftTeethX, nowMouthPaddingY + nowTeethHeight, leftTeethX - nowTeethWidth, nowMouthPaddingY);
        triangle(rightTeethX, nowMouthPaddingY, rightTeethX, nowMouthPaddingY + nowTeethHeight, rightTeethX + nowTeethWidth, nowMouthPaddingY);
        pop();
    }
}

class NYFlowPoint {
    constructor(_x, _y, _width, _dir) {
        this.x = _x;
        this.y = _y;
        this.width = _width;
        this.dir = _dir;

        let leftX = this.x + sin(radians(_dir - 90)) * _width * 0.5;
        let leftY = this.y + -cos(radians(_dir - 90)) * _width * 0.5;

        let rightX = this.x + sin(radians(_dir + 90)) * _width * 0.5;
        let rightY = this.y + -cos(radians(_dir + 90)) * _width * 0.5;

        this.leftPoint = { 'x': leftX, 'y': leftY };
        this.rightPoint = { 'x': rightX, 'y': rightY };
    }
}

class NYNoiseSet {
    constructor(_scaleX = 0.01, _scaleY = 0.01, _scaleZ = 0.01) {
        this.startX = random(-100000, 100000);
        this.startY = random(-100000, 100000);
        this.startZ = random(-100000, 100000);
        this.scaleX = _scaleX;
        this.scaleY = _scaleY;
        this.scaleZ = _scaleZ;
    }

    noise(_x = 0, _y = 0, _z = 0) {
        return noise(this.scaleX * _x + this.startX, this.scaleY * _y + this.startY, this.scaleZ * _z + this.startZ);
    }
}

class NYColor {
    constructor(_h, _s, _b, _a = 1.0) {
        this.h = _h;
        this.s = _s;
        this.b = _b;
        this.a = _a;
    }

    copy() {
        return new NYColor(this.h, this.s, this.b, this.a);
    }

    slightRandomize(_hDiff = 10, _sDiff = 12, _bDiff = 12, _aDiff = 0.0) {
        this.h += random(-0.5 * _hDiff, 0.5 * _hDiff);
        this.s += random(-0.5 * _sDiff, 0.5 * _sDiff);
        this.b += random(-0.5 * _bDiff, 0.5 * _bDiff);
        this.a += random(-0.5 * _aDiff, 0.5 * _aDiff);

        this.h = processHue(this.h);
    }

    color() {
        return color(this.h, this.s, this.b, this.a);
    }

    static newRandomColor(_mainHue) {
        let h = processHue(_mainHue + random(-80, 80));
        let s = random(40, 100);
        let b = random(60, 100);

        return new NYColor(h, s, b);
    }
}


