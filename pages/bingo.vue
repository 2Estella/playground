<script setup lang="ts">
let boardSize = ref<number>(5);
let isReady = ref<boolean>(false);
let shuffle = ref<number[]>([]);
/**
 * 번호를 섞는 함수
 */
const mixNumbers = async (): Promise<void> => {
  resetBingo();

  const numbers: number[] = new Array(Math.pow(boardSize.value, 2)).fill(0).map((_, index) => index + 1);

  while (numbers.length) {
    shuffle.value.push(numbers.splice(Math.floor(Math.random() * numbers.length), 1)[0]);
  }

  numberCandidate = [...shuffle.value];

  await setAnimation();

  getWinNumArr();

  isReady.value = true;
};

const setAnimation = async () => {
  for (let i = 0; i <= 5; i++) {
    if (i <= 5) {
      setTimeout(() => {
        shuffleNumber(shuffle.value);
      }, 1000 * (i + 1));
    }
  }
};

/**
 * 배열을 랜덤으로 섞어주는 함수
 *
 * @param array 순서를 섞을 배열
 */
const shuffleNumber = (array: number[]) => {
  array.sort(() => Math.random() - 0.5);
};

/**
 * 1차원 배열을 원하는 길이만큼 잘라서 2차원 배열로 리턴하는 함수
 *
 * @param array 나누고 싶은 배열
 * @param num 나누고 싶은 길이
 *
 * @return 가공된 2차원 배열
 */
const divideArray = (array: number[], num: number): number[][] => {
  const divide = Math.floor(array.length / num) + (Math.floor(array.length % num) > 0 ? 1 : 0);
  const newArray: number[][] = [];

  for (let i = 0; i <= divide - 1 ; i++) {
    newArray.push(array.splice(0, num));
  }

  return newArray;
};

let winNumArr: (number | boolean)[][] = [];
/**
 * 빙고를 이기는 모든 경우의 수를 2차원 배열로 생성하는 함수
 */
const getWinNumArr = (): void => {
  boardSize.value = Number(boardSize.value);

  // 가로 배열 구하기
  winNumArr = divideArray([...shuffle.value], boardSize.value);

  // 세로 배열 구하기
  let colArr: any = [];

  for (let i = 0; i < winNumArr.length; i++ ) {
    for (let j = 0; j < winNumArr[i].length; j++) {
      if (i < boardSize.value) {
        colArr.push(winNumArr[j][i]);
      }
    }
  }

  colArr = divideArray([...colArr], boardSize.value);

  for (let i = 0; i < colArr.length; i++) {
    winNumArr.push(colArr[i]);
  }

  // 크로스 배열 구하기
  let left: number[] = [];
  let right: number[] = [];

  for (let i = 0; i < shuffle.value.length; i++) {
    if (i === 0 || i % (boardSize.value + 1) === 0) {
      left.push(shuffle.value[i]);
    }
    if (!(i === 0) && i % (boardSize.value - 1) === 0 && !(i === Math.pow(boardSize.value, 2) - 1)) {
      right.push(shuffle.value[i]);
    }
  }

  winNumArr.push(left);
  winNumArr.push(right);

  console.log(winNumArr);
};

let pickedNumber = ref<number>(0);
let pickedNumArr = ref<number[]>([]);
let numberCandidate: number[] = [];
/**
 * 번호 뽑기 이벤트 함수
 *
 * 랜덤으로 번호를 뽑은 후 빙고가 됐는지 확인하는 함수(checkBingo)를 실행 함
 */
const getNumber = (): void => {
  if (!isReady.value) {
    return;
  }

  pickedNumber.value = 0;

  let randomNum = numberCandidate.splice(Math.floor(Math.random() * numberCandidate.length), 1)[0];

  pickedNumArr.value.push(randomNum);

  pickedNumber.value = randomNum;

  checkBingo();
};

/**
 * 뽑은 숫자에 해당하는 빙고판의 숫자에 클래스를 넣어주는 함수
 */
const checkNum = (num: number): string => {
  return pickedNumArr.value.includes(num) ? 'checked' : '';
};

let isDone: boolean = false;
let bingo = ref<number> (0);
/**
 * 빙고가 완성됐는지 확인 하는 함수
 */
const checkBingo = (): void => {
  bingo.value = 0;

  for (let i = 0; i < winNumArr.length; i++ ) {
    for (let j = 0; j < winNumArr[i].length; j++) {
      if (pickedNumber.value === winNumArr[i][j]) {
        winNumArr[i][j] = true;
      }
    }
  }

  winNumArr.map((item) => {
    let countPick = 0;

    item.map((data) => {
      if (data === true) {
        countPick++;
      }
    });

    if (countPick === boardSize.value) {
      bingo.value++;
    }
  });

  if (bingo.value >= 3) {
    isDone = true;
  }
};

/**
 * 빙고 초기화 시키는 함수
 */
const resetBingo = (): void => {
  bingo.value = 0;
  pickedNumber.value = 0;
  shuffle.value = [];
  winNumArr = [];
  pickedNumArr.value = [];
  numberCandidate = [];
};

/**
 * 빙고 게임을 다시 실행 시키는 함수
 */
const restart = (): void => {
  isDone = false;
  isReady.value = false;

  resetBingo();
};
</script>

<template>
  <div class="fix" v-if="isDone"></div>
  <div id="bingoWrap">
    <h1>★BINGO★</h1>

    <div class="contentWrap">
      <div class="numberBox">
        <template v-if="isReady">
          <div class="drawNumber">
            {{ pickedNumber }}
          </div>
          <a
            href="#"
            :class="[isReady ? 'btn' : '' ]"
            @click.prevent="getNumber"
          >
            번호 뽑기
          </a>
        </template>
      </div>

      <div class="boardBox">
        <template v-if="!isReady">
          <div class="infoText">
            <div class="boardSize">
              <p>원하는 빙고판의 크기를 선택하고,</p>
              <select name="boardSize" v-model="boardSize">
                <option value="3">3 x 3</option>
                <option value="4">4 x 4</option>
                <option value="5">5 x 5</option>
                <option value="6">6 x 6</option>
                <option value="7">7 x 7</option>
                <option value="8">8 x 8</option>
              </select>
            </div>
            <p class="info"><span>빙고 번호</span>를 섞어주세요!</p>
          </div>
        </template>

        <template v-else>
          <TransitionGroup
            appear
            name="list"
            tag="ul"
            class="board"
            :style="`grid-template-columns: repeat(${boardSize}, 1fr)`"
          >
            <li
              :key="`key + ${item}`"
              :class="[`item n${item}`, checkNum(item)]"
              :data-index="index"
              v-for="(item, index) in shuffle"
            >
              <span>
                {{ item }}
              </span>
              <div class="xMark">
                <div>
                  <span class="left"></span>
                  <span class="right"></span>
                </div>
              </div>
            </li>
          </TransitionGroup>
        </template>

        <template v-if="!isReady">
          <a class="mixBtn" href="#" @click.prevent="mixNumbers">번호 섞기</a>
        </template>
      </div>
    </div>

    <template v-if="isDone">
      <div class="infoBox">
        <span>빙고 성공!</span>
        <a href="#" @click.prevent="restart">다시하기</a>
      </div>
    </template>
  </div>
</template>