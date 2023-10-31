<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

let level = ref<number>(0);

interface BoardSizeType {
  row: number
  column: number
  total: number
  mine: number
}

const boardSize: BoardSizeType[] = [
  {
    row: 9,
    column: 9,
    total: 81,
    mine: 10,
  },
  {
    row: 16,
    column: 16,
    total: 256,
    mine: 40,
  },
  {
    row: 16,
    column: 30,
    total: 480,
    mine: 99,
  },
];

let coordinate: number[][] = [];
const boardArr = ref<any[]>([]);

let total = ref<number>(0);
let boardRow = ref<number>(0);
let boardCol = ref<number>(0);

let mineTotal = ref<number>(0);
let flagTotal = ref<number>(0);

/**
 * 게임 보드를 그려주는 함수
 */
const drawBoard = (): void => {
  total.value = boardSize[level.value].total;
  boardRow.value = boardSize[level.value].row;
  boardCol.value = boardSize[level.value].column;

  coordinate = new Array(boardRow.value)
    .fill(0)
    .map(() => new Array(boardCol.value).fill(0));

  let location: number[][] = [];

  for (let i = 0; i < boardRow.value; i++) {
    for (let j = 0; j < boardCol.value; j++) {
      location.push([i, j]);
    }
  }

  boardArr.value = new Array(total.value).fill(0).map((item, index) => ({
    isChecked: false,
    isHovering: false,
    flagged: false,
    idx: index,
    row: location[index][0],
    col: location[index][1],
  }));

  boardArr.value = divideArray(boardArr.value, boardCol.value);

  mineTotal.value = boardSize[level.value].mine;
  flagTotal.value = boardSize[level.value].mine;
};

/**
 * 클릭한 셀에 지뢰가 있는 지 확인하는 함수
 *
 * 세 가지 조건에 따라 실행되는 것이 다름
 *   1. isStartGame.value가 false인 경우(게임 시작 전), 지뢰를 배치함
 *   2. 해당 셀의 countMine 값이 -1 인 경우(해당 셀이 지뢰), 게임이 종료 됨
 *   3. 해당 셀의 isChecked와 flagged의 값이 false인 경우(체크가 되지 않고, 깃발도 아닌 경우), isChecked의 값을 true로 변경하고 근처의 셀을 탐색하는 checkAroundCell 함수 실행
 *
 * @param row 해당 셀의 행
 * @param col 해당 셀의 열
 */
const findMine = (row: number, col: number) => {
  if (!isStartGame.value) {
    spreadMines(row, col);

    for (let i = 0; i < boardRow.value; i++) {
      for (let j = 0; j < boardCol.value; j++) {
        boardArr.value[i][j].countMine = coordinate[i][j];
      }
    }

    countSecond();
  }

  if (boardArr.value[row][col].countMine === -1) {
    isGameOver.value = true;
  }

  if (!boardArr.value[row][col].isChecked && !boardArr.value[row][col].flagged) {
    boardArr.value[row][col].isChecked = true;

    checkAroundCell(row, col);
  }

  setTimeout(() => winGame(), 100);
};

/**
 * 지뢰를 설치하는 함수
 *
 * @param row 해당 셀의 행
 * @param col 해당 셀의 열
 */
const spreadMines = (row: number, col: number): void => {
  for (let i = 0; i < boardSize[level.value].mine; i++) {
    let randomRow: number = Math.floor(Math.random() * boardRow.value);
    let randomCol: number = Math.floor(Math.random() * boardCol.value);

    if (row !== randomRow && col !== randomCol) {
      if (coordinate[randomRow][randomCol] === -1) {
        i--;
      } else {
        coordinate[randomRow][randomCol] = -1;

        console.log(randomRow, randomCol);
        countMine(randomRow, randomCol);
      }
    }
  }
};

/**
 * 주변의 셀에 지뢰가 있는 지 카운트 하는 함수
 *
 * @param row 해당 셀의 행
 * @param col 해당 셀의 열
 */
const countMine = (row: number, col: number) => {
  for (let i = row - 1; i < row + 2; i++) {
    if (boardArr.value[i]) {
      for (let j = col - 1; j < col + 2; j++) {
        if (boardArr.value[i][j]) {
          if (coordinate[i][j] !== -1) {
            coordinate[i][j] += 1;
          }
        }
      }
    }
  }
};

/**
 * 맞닿아 있는 셀을 오픈하고 해당 셀의 지뢰 개수가 0인 경우 함수를 다시 실행
 *
 * @param row 클릭한 셀의 행
 * @param col 클릭한 셀의 열
 */
const checkAroundCell = (row: number, col: number): void => {
  let aroundCellArr: number[][] = [];

  if (coordinate[row][col] === 0) {
    for (let i = row - 1; i < row + 2; i++) {
      if (boardArr.value[i]) {
        for (let j = col - 1; j < col + 2; j++) {
          if (boardArr.value[i][j]) {
            if (!boardArr.value[i][j].isChecked && !boardArr.value[i][j].flagged) {
              boardArr.value[i][j].isChecked = true;

              aroundCellArr.push([i, j]);
            }
          }
        }
      }
    }
  }

  if (aroundCellArr.length) {
    aroundCellArr.forEach(item => {
      let r: number = item[0];
      let c: number = item[1];

      checkAroundCell(r, c);
    });
  }
};

let isStartGame = ref<boolean>(false);
/**
 * 게임 시작 여부를 체크하는 isStartGame을 true로 변경해주는 함수
 */
const startGame = (): void => {
  isStartGame.value = true;
};

/**
 * 우클릭 시 깃발을 설치하는 함수
 */
const rightClick = (row: number, col: number): void => {
  if (boardArr.value[row][col].flagged) {
    boardArr.value[row][col].flagged = false;
    flagTotal.value++;

  } else if (flagTotal.value && !boardArr.value[row][col].isChecked) {
    boardArr.value[row][col].flagged = true;
    flagTotal.value--;
  }
  // else {
  //   !flagTotal.value
  //     ? console.log('더 이상 깃발을 설치할 수 없습니다.')
  //     : console.log('이곳에 깃발을 설치할 수 없습니다.')
  // }

  setTimeout(() => winGame(), 100);
};

/**
 * 양쪽 클릭 했을 때
 *
 * @param event
 */
const bothClick = (event: MouseEvent): void => {
  if (event.buttons === 3) {
    doubleSideClick();
  }
};

/**
 * 열린 셀을 양 쪽 클릭을 했을 때 실행되는 함수
 */
const doubleSideClick = (): void => {
  let flagTotal = 0;
  let cellArr: number[][] = [];

  for (let i = cellRow - 1; i < cellRow + 2; i++) {
    if (boardArr.value[i]) {
      for (let j = cellCol - 1; j < cellCol + 2; j++) {
        if (boardArr.value[i][j]) {
          if (boardArr.value[i][j].flagged) {
            flagTotal++;
          }

          if (!boardArr.value[i][j].isChecked && !boardArr.value[i][j].flagged) {
            cellArr.push([i, j]);
            boardArr.value[i][j].isHovering = true;
          }
        }
      }
    }
  }

  // 깃발의 수와 힌트 수가 같은 경우
  if (flagTotal === boardArr.value[cellRow][cellCol].countMine) {
    cellArr.forEach(item => {
      let r: number = item[0];
      let c: number = item[1];

      if (flagTotal === boardArr.value[cellRow][cellCol].countMine) {
        if (coordinate[r][c] === -1 && !boardArr.value[r][c].flagged) {
          isGameOver.value = true;
        }

        if (!boardArr.value[r][c].isChecked && !boardArr.value[r][c].flagged) {
          boardArr.value[r][c].isChecked = true;

          checkAroundCell(r, c);
        }
      }
    });
  }
};

let cellRow: number = 0;
let cellCol: number = 0;
/**
 * 셀의 좌표를 입력 받아 cellRow, cellCol 값으로 각각 업데이트 해주는 함수
 */
const getLocate = (row: number, col: number): void => {
  cellRow = row;
  cellCol = col;
};

/**
 * 셀에 클래스를 넣어주는 함수
 */
const setClass = (row: number, col: number): string => {
  if (boardArr.value[row][col].countMine < 0 && isGameOver.value) {
    return 'mine';

  } else if (boardArr.value[row][col].isChecked) {
    return 'checked';

  } else if (boardArr.value[row][col].flagged) {
    return 'flagged';
  }

  return '';
};

let isGameOver = ref<boolean>(false);
let isWin = ref<boolean>(false);
/**
 * 게임을 초기화하는 함수
 */
const resetGame = (): void => {
  time.value = 0;

  coordinate = [];
  boardArr.value = [];

  isStartGame.value = false;
  isGameOver.value = false;
  isWin.value = false;

  mineTotal.value = 0;
};

/**
 * 게임을 종료 시키는 함수
 */
const endGame = (): void => {
  isGameOver.value = true;
};

/**
 * 게임이 승리했는 지 확인하는 함수
 *
 * 모든 체크된 셀과 깃발의 수를 합쳐서 전체 셀 수와 동일하면 승리
 */
const winGame = (): void => {
  let flagTotal = document.querySelectorAll('.flagged').length;
  let checkedTotal = document.querySelectorAll('.checked').length;

  if (checkedTotal + flagTotal === total.value) {
    isWin.value = true;
  }
};

const time = ref<number>(0);
/**
 * 경과 시간을 초단위로 계산하는 함수
 */
const countSecond = (): void => {
  const setTime = setInterval(() => {
    if (time.value === 999 || isGameOver.value || isWin.value || !isStartGame.value) {
      clearInterval(setTime);
    }

    time.value += 1;

  }, 1000);
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
  const divide =
    Math.floor(array.length / num) +
    (Math.floor(array.length % num) > 0 ? 1 : 0);
  const newArray: number[][] = [];

  for (let i = 0; i <= divide - 1; i++) {
    newArray.push(array.splice(0, num));
  }

  return newArray;
};

// const test = (row: number, col: number): void => {
//   boardArr.value[row][col].isHovering = false
// }

watch(level, () => {
  isStartGame.value = false;

  resetGame();
  drawBoard();
});

onMounted(() => {
  drawBoard();
});
</script>
<template>
  <div id="minesweeperContainer" @contextmenu.prevent>
    <h2>minesweeper</h2>

    <div :class="['content', `lv${level}`]">
      <div class="topArea">
        <select name="level" v-model="level">
          <option value="0">초급</option>
          <option value="1">중급</option>
          <option value="2">고급</option>
        </select>

        <div class="infoBox">
          <div>💣: {{ mineTotal }}</div>
          <div>⏰: {{ time }}</div>
        </div>
      </div>

      <div class="gameBoard" @click.once="startGame()">
        <TransitionGroup
          appear
          name="list"
          tag="ul"
          class="board"
          :style="`grid-template-columns: repeat(${boardSize[level].column}, 1fr)`"
        >
          <template v-for="items in boardArr">
            <li
              :key="`key + ${item.idx}`"
              :class="[
                `item n${item.countMine}`,
                setClass(item.row, item.col)]"
              @mouseenter="getLocate(item.row, item.col)"
              @click="[!item.isChecked ? findMine(item.row, item.col) : '']"
              @mousedown="bothClick"
              @mouseup.right="rightClick(item.row, item.col)"
              v-for="item in items"
            >
              <span v-if="isStartGame">
                {{ item.countMine < 0 ? item.countMine : '' }}
                {{ item.countMine > 0 && item.isChecked ? item.countMine : '' }}
              </span>
            </li>
          </template>
        </TransitionGroup>
      </div>
      <div class="endBtn" v-if="isStartGame">
        <a href="#" @click.prevent="endGame()">게임 그만하기</a>
      </div>

      <div class="resultBox" v-if="isWin || isGameOver">
        <p class="win" v-if="isWin">
          🎉 WIN! 🎉<br />
          <span>⏰: {{ time }}</span>
        </p>

        <span v-if="isGameOver">🔥 Game Over 🔥</span>
      </div>
    </div>
  </div>
</template>