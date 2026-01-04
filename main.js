let catName;
let qNum = document.querySelector('.info .quiz-num span');
let answersCont = document.querySelector('.answers');
let subbut = document.querySelector('input[type="submit"]');
let spansBullets;
let rank = document.querySelector('.finish .rank');
let timeLeft;
let countdownAudio = document.querySelector('.countdown-audio');

let qIndex = 0;
let rightAnswers = 0;
let objRequest;

addCats([['analysis2', 'تحليل 2'], ['analysis3', 'تحليل 3'], ['math_programming', 'برمجة رياضية'],
    ['arabic', 'اللغة العربية'], ['microprocessor', 'معالج مصغر'], ['diagrams', 'مخططات']]);

document.querySelector('.start').onclick = () => {
    document.querySelector('.slide-audio').play();
    document.querySelector('.content').style.left = '0';
    let ctgrInps = Array.from(document.querySelectorAll('.ctgrs input'));
    let categorySpn = document.querySelector('.info .category span');
    ctgrInps.forEach((c) => {
        if (c.checked) {
            catName = c.dataset.cat.split(',')[0];
            categorySpn.innerHTML = c.dataset.cat.split(',')[1];
        }
    })
    getQuestions();
    document.querySelector('.choose-ctgr').remove();
}

function addCats(cats) {
    for (let i = 0; i < cats.length; i++) {
        let label = document.createElement('label');
    
        let catInp = document.createElement('input');
        catInp.setAttribute('type', 'radio');
        catInp.setAttribute('name', 'ctgr');
        catInp.dataset.cat = cats[i];
        if (i === 0) catInp.checked = true;
        label.appendChild(catInp);
            
        let dv = document.createElement('div');
        dv.innerHTML = cats[i][1];
        label.appendChild(dv);

        document.querySelector('.ctgrs').appendChild(label);
    }
}

function getQuestions() {
    let myRequest = new XMLHttpRequest();

    myRequest.onreadystatechange = () => {
        if (myRequest.readyState === 4 && myRequest.status === 200) {
            objRequest = JSON.parse(myRequest.responseText);
            shuffle(objRequest);
            objRequest = objRequest.slice(0, 20); // Number Of Quistions

            qNum.innerHTML = objRequest.length;
            createBullets(objRequest.length);

            addData(objRequest[qIndex]);
            
        }
    }
    
    myRequest.open("GET", `JSON/${catName}_questions.json`, true);
    myRequest.send();
}

function createBullets (num) {
    for (let i = 0; i < num; i++) {
        let spn = document.createElement('span');
        document.querySelector('.bullets').appendChild(spn);
        if (i === 0) spn.classList.add('on');
        spansBullets = Array.from(document.querySelectorAll('.bullets span'))
    }
}

function addData(obj) {
    timer(5);
    document.querySelector('.question h2').append(obj.title);
    for (let i = 1; i <= 4; i++) {
        let ans = document.createElement('div');
        ans.className = 'answer';
        
        let inp = document.createElement('input');
        inp.setAttribute('type', 'radio');
        inp.setAttribute('name', 'answers');
        inp.setAttribute('id', `answer_${i}`);
        inp.dataset.answer = obj[`answer_${i}`];
        ans.appendChild(inp);

        let label = document.createElement('label');
        label.htmlFor = `answer_${i}`;
        label.append(obj[`answer_${i}`]);
        ans.appendChild(label);
        
        answersCont.appendChild(ans);
    }
}

function resetData() {
    document.querySelector('.question h2').innerHTML = '';
    answersCont.innerHTML = '';
}

subbut.addEventListener('click', (e) => {
    clearInterval(timeLeft);
    countdownAudio.pause();
    countdownAudio.currentTime = 0;
    e.preventDefault();
    checkAns(objRequest[qIndex]);
    subbut.style.display = 'none';
    setTimeout(() => {
        qIndex++;
        if (qIndex < objRequest.length) {
            resetData();
            addData(objRequest[qIndex]);
            spansBullets[qIndex].className = 'on';
        } else {
            document.querySelector('form').remove();
            addResult(objRequest.length);
            settingTime(0);
        }
        subbut.style.display = 'block';
    }, 1500)
})

function checkAns(obj) {
    let checked = false;
    document.getElementsByName('answers').forEach(ans => {
        if (ans.dataset.answer === obj.correct_ans) {
            ans.classList.add('right');
        }
        if (ans.checked) {
            checked = true;
            if (ans.dataset.answer === obj.correct_ans) {
                rightAnswers++;
                spansBullets[qIndex].className = 'right';
                document.querySelector('.right-audio').play();
            } else {
                spansBullets[qIndex].className = 'wrong';
                ans.classList.add('wrong');
                document.querySelector('.wrong-audio').play();
            }
        }
    });
    if(!checked) {
        document.getElementsByName('answers').forEach(ans => {
            if (ans.dataset.answer === obj.correct_ans) {
                ans.classList.add('right');
            } else {
                spansBullets[qIndex].className = 'wrong';
                ans.classList.add('wrong');
                document.querySelector('.wrong-audio').play();
            }
        })
    }
}

function addResult(from) {
    document.querySelector('.finish').style.display = 'block';
    document.querySelector('.result').classList.add('apear');
    document.querySelector('.finish .r-ans').innerHTML = rightAnswers;
    document.querySelector('.finish .all-ans').innerHTML = from;
    let per = Math.ceil(rightAnswers * 100 / from);
    rank.innerHTML = `${per}%`;
    if (per >= 60) {
        rank.classList.add('passed');
        document.querySelector('.tada-audio').play();
    } else {
        rank.classList.add('failed');
        document.querySelector('.fail-audio').play();
    }
}

function shuffle(array) {
for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
}

}

function timer(sec) {
    settingTime(sec);
    sec > 0 ? sec-- : subbut.click();
    timeLeft = setInterval(() => {
        settingTime(sec);
        sec > 0 ? sec-- : subbut.click();
    }, 1000)
}

function settingTime(sec) {
    if (sec === 3) countdownAudio.play();
    let minutes = Math.floor(sec / 60);
    let seconds = Math.floor(sec % 60);
    document.querySelector('.min').innerHTML = minutes > 9 ? minutes : `0${minutes}`;
    document.querySelector('.sec').innerHTML = seconds > 9 ? seconds : `0${seconds}`;
    document.querySelector('.more-info .time').style.color = sec > 3 ? 'black' : 'rgb(182, 8, 8)';
}