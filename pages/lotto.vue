<script setup lang="ts">
import { ref } from 'vue';
import type { Ref } from 'vue';

let winNumbers: Ref<number[]> = ref([]);
let lottoGroup: Ref<number> = ref(0);
/**
 * 로또 번호를 섞어주는 함수
 * - 1부터 45까지의 배열을 만들고, while문을 사용하여 랜덤으로 뽑은 숫자를 새로운 배열(shuffle)에 하나씩 추가함.
 * 그 후 앞에서부터 6개의 숫자를 잘라서 오름차순으로 정렬하여 winNumbers 변수에 담아줌.
 */
const shuffleNumbers = (): void => {
  const numbers: Number[] = new Array(45).fill(0).map((item: number, index: number) => index + 1);

  let shuffle: any[] = [];

  while (numbers.length > 0) {
    shuffle.push(numbers.splice(Math.floor(Math.random() * numbers.length), 1)[0]);
  }

  winNumbers.value = shuffle.slice(0, 6).sort((a: number, b: number) => a - b);
};

/**
 * 추첨 번호를 생성하는 함수
 * - shuffleNumbers 함수를 실행하여 추첨 번호를 얻고, 주어진 조건에 맞는 경우 shuffleNumbers 함수를 추가로 실행하여 새로운 추첨 번호를 얻음
 *  - 조건
 *    1. 추첨 번호가 첫수가 30이상이거나 끝수가 15이하인 경우
 *    2. 추첨 번호가 전체 짝수이거나 홀수인 경우
 *    3. 6연번이 나오는 경우
 */
const getWinNumbers = (): void => {
  shuffleNumbers();

  // 추첨 번호가 첫수가 30이상이거나 끝수가 15이하인 경우
  if (Math.min(...winNumbers.value) >= 30 || Math.max(...winNumbers.value) <= 15) {
    shuffleNumbers();
  }

  // 추첨 번호가 전체 짝수이거나 홀수인 경우
  let countEven: number = 0;

  winNumbers.value.map((item) => {
    if (item % 2 === 0) {
      countEven++;
    }
  });

  if (countEven === 0 || countEven === 6) {
    shuffleNumbers();
  }

  // 6연번이 나오는 경우
  let countNum: number = 0;

  for (let i = 0; i < winNumbers.value.length; i++) {
    for (let j = i + 1; j < winNumbers.value.length; j++) {
      if ((winNumbers.value[i] + 1) === winNumbers.value[j]){
        countNum++;
      }
    }
  }

  if (countNum === 6) {
    shuffleNumbers();
  }
};

/**
 * 추첨 숫자를 Template 안에 공으로 생성하는 함수
 */
const drawBall = (): void => {
  const resultBox = document.querySelector('.resultBox') as HTMLElement;

  for (let k = 0; k < lottoGroup.value; k++) {
    const ballRow: HTMLDivElement = document.createElement('div');

    setTimeout(() => {
      getWinNumbers();

      for (let i = 0; i < winNumbers.value.length; i++) {

        setTimeout(() => {
          const ball: HTMLSpanElement = document.createElement('span');

          ball.className = `ball i${k}-${winNumbers.value[i]}`;
          colorize(winNumbers.value[i], ball);
          // ball.textContent = String(winNumbers.value[i])

          ball.textContent = String(winNumbers.value[i]);
          // let count = 0
          // ball.textContent = String(setInterval((): void => {
          //   if (count === winNumbers.value[i]) {
          //     return
          //   }
          //   count += 1
          //   ball.textContent = String(count)
          // }, 20))

          ballRow?.appendChild(ball);

          if (ballRow.childElementCount === 6) {
            setTimeout((): void => {
              ballRow.className = 'ballRow';
            }, 500);
          }

        }, 500 * (i + 1));

        resultBox?.appendChild(ballRow);
      }
    }, 3500 * k);

    setTimeout(() => {
      isDone.value = true;
    }, 4000 * lottoGroup.value);
  }

};

let isDone: Ref<boolean> = ref(false);
/**
 * 로또번호 받기 버튼 클릭 시 실행되는 함수
 * - 사용자가 입력한 출력 개수를 확인하여 5 이하일 경우 drawBall 함수를 실행.
 * 출력 개수를 입력하지 않거나 음수 입력 시 1로 할당함.
 */
const startGetWinNumbers = (): void => {
  const resultBox = document.querySelector('.resultBox') as HTMLElement;

  if (lottoGroup.value > 5) {
    alert('최대 5쌍의 번호만 출력할 수 있습니다.');
    return;
  } else if (lottoGroup.value <= 0) {
    lottoGroup.value = 1;
  }

  if (resultBox.childNodes.length > 0) {
    if (!confirm('받은 로또 번호가 초기화 됩니다. 진행 하시겠습니까?')) {
      return;
    }
  }

  isDone.value = false;
  resultBox.innerHTML = '';

  drawBall();

  lottoGroup.value = 0;
};

/**
 * 추첨 번호에 따라 글자,배경 색상을 지정하는 함수
 * - 추첨 번호의 크기에 따라서 공의 색상을 정해줌
 * @param number 추첨 번호
 * @param ball 번호가 들어가는 HTMLElement
 */
const colorize = (number: number, ball: HTMLElement): void => {
  if (number < 10) {
    ball.style.backgroundColor = '#fbc400';

  } else if (number < 20) {
    ball.style.backgroundColor = '#ff7272';
    ball.style.color = '#fff';

  } else if (number < 30) {
    ball.style.backgroundColor = '#69c8f2';
    ball.style.color = '#fff';

  } else if (number < 40) {
    ball.style.backgroundColor = '#b0d840';
    ball.style.color = '#fff';

  } else {
    ball.style.backgroundColor = '#aaa';
  }
};

/**
 * 1-2-3-4-5-6 이론
 * 지금까지 로또 1등 당첨 번호 중 극단적인 조합(연번 등)이 나오지 않는다는 이론
 *
 * 6연번 (30-31-32-33-34-35-36 등)
 * 6번호 연속 행렬 조합 (6-12-18-24-30-36, 5-10-15-20-25-30 등)
 * 특정 번호대에서만 6번호가 모두 나오는 조합 (21-23-24-27-28-29 등)
 * 첫수가 30 이상인 경우 (30-32-34-35-39-41 등)
 * 끝수가 15 이하인 경우 (1-3-4-9-12-14 등)
 * 6개의 모든 번호가 홀수이거나 짝수인 경우 (3-13-17-21-35-39 등)
 */

/**
 * 고정수(카오스) 이론
 * 몇 주 연속으로 고정으로 나오면 해당 숫자는 그 다음주에도 고정으로 나올 수 있다는 이론
 */
</script>
<template>
  <div id="lottoWrap">
    <h1>로또번호 생성기</h1>
    <p>출력할 세트 개수를 입력하세요.</p>

    <div class="inputBtnBox">
      <input type="number" placeholder="생성" v-model="lottoGroup" />
      <a
        href="#"
        class="btn"
        @click.prevent="startGetWinNumbers()"
      >
        로또번호 받기
      </a>
    </div>

    <div class="resultBox">
    </div>

    <div
      class="luckyText"
      v-if="isDone"
    >
      1등 당첨을 기원합니다!!!!
    </div>

  </div>
</template>