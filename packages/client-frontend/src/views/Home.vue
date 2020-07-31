<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <!-- view title -->
        <p class="text-center text-h3">How to Play the Guessing Game</p>
      </v-col>

      <v-col sm="9" md="6" xs="12">
        <p class="font-weight-bold">
          Game Rules:
        </p>
        <ul>
          <li>when the game starts, the computer choses a random, secret number</li>
          <li>in a set order, players take turns guessing the secret number</li>
          <li>there are two possible ways to win:
            <ul>
              <li>if player X guesses correctly, they will instantly win</li>
              <li>if player X's guess is the closest guess so far, and another player doesn't make a closer guess after player X makes theirs, player X will win at the start of their next turn</li>
            </ul>
          </li>
        </ul>
      </v-col>
    </v-row>
  </v-container>
</template>
