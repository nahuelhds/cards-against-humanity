import React, { Component } from "react";
import PropTypes from "prop-types";

import { MyHand } from "./components/MyHand";
import { BlackCardView } from "./components/BlackCardView";
import { WhiteCards } from "./components/WhiteCards";
import { Status } from "./components/Status";
import {
  COUNT_DOWN_SECONDS,
  STAGE_CHOSEN_WINNER,
  STAGE_DRAW_BLACK_CARD,
} from "../../constants";
import { PositionsTable } from "./components/PositionsTable";

export default class BoardContainer extends Component {
  static propTypes = {
    G: PropTypes.any.isRequired,
    ctx: PropTypes.any.isRequired,
    moves: PropTypes.any.isRequired,
    playerID: PropTypes.string,
    isActive: PropTypes.bool,
    isMultiplayer: PropTypes.bool,
  };

  countDownIntervalID = false;

  state = {
    nextTurnInSeconds: COUNT_DOWN_SECONDS,
  };

  componentDidUpdate(prevProps) {
    const { ctx, G, playerID } = this.props;
    const { activePlayers } = ctx;
    const { winnerPlayerID } = G;

    const prevStage = prevProps.ctx.activePlayers[playerID];
    const stage = activePlayers[playerID];
    if (
      prevProps.G.winnerPlayerID !== winnerPlayerID &&
      prevProps.G.winnerPlayerID === null
    ) {
      this.startCountDown();
    }
    if (prevStage === STAGE_CHOSEN_WINNER && stage === STAGE_DRAW_BLACK_CARD) {
      this.setState({
        nextTurnInSeconds: COUNT_DOWN_SECONDS,
      });
    }
  }

  startCountDown = () => {
    setTimeout(() => {
      this.handleEndThisTurn();
    }, COUNT_DOWN_SECONDS * 1000);
    this.countDownIntervalID = setInterval(() => {
      this.setState({ nextTurnInSeconds: this.state.nextTurnInSeconds - 1 });
    }, 1000);
  };

  handleDrawBlackCard = () => {
    this.props.moves.DrawABlackCard();
  };

  handleWhiteCardSelection = (chosenWhiteCard) => {
    const { playerID } = this.props;
    this.props.moves.ChangeWhiteCard(playerID, chosenWhiteCard);
  };

  handleSelectedWhiteCard = () => {
    const { playerID } = this.props;
    this.props.moves.SelectWhiteCard(playerID);
  };

  handleWinnerSelection = (chosenWinnerID) => {
    this.props.moves.ChangeWinner(chosenWinnerID);
  };

  handleSelectedWinner = () => {
    this.props.moves.SelectWinner();
  };

  handleEndThisTurn = () => {
    const {
      playerID,
      ctx: { currentPlayer },
    } = this.props;
    if (currentPlayer === playerID) {
      this.props.moves.EndThisTurn();
    }
    setTimeout(() => {
      clearInterval(this.countDownIntervalID);
      this.setState({
        nextTurnInSeconds: COUNT_DOWN_SECONDS,
      });
    }, 1000);
  };

  render() {
    const {
      playerID,
      ctx: { currentPlayer, activePlayers, playOrder },
      G: {
        blackDeck,
        hands,
        activeBlackCard,
        selectedwhiteCardsOrder,
        selectedWhiteCards,
        chosenWhiteCard,
        allWhiteCardsAreSelected,
        chosenWinnerID,
        winnerPlayerID,
        wonBlackCards,
      },
    } = this.props;

    const { nextTurnInSeconds } = this.state;
    const stage = activePlayers[playerID];
    const isMyTurn = currentPlayer === playerID;
    const isSelectedWhiteCardSent =
      selectedWhiteCards[playerID] && selectedWhiteCards[playerID] !== null;

    return (
      <div className="pb-64">
        <div className="flex justify-center sticky top-0 z-10">
          <Status
            stage={stage}
            isMyTurn={isMyTurn}
            currentPlayer={currentPlayer}
            winnerPlayer={winnerPlayerID}
            nextTurnInSeconds={nextTurnInSeconds}
          />
          <div className="absolute top-0 right-0 z-10">
            <PositionsTable
              wonBlackCards={wonBlackCards}
              playerIDs={playOrder}
            />
          </div>
        </div>
        <div className="flex items-start">
          <BlackCardView
            className={`sticky top-0`}
            stage={stage}
            isMyTurn={isMyTurn}
            activeBlackCard={activeBlackCard}
            handleDrawBlackCard={this.handleDrawBlackCard}
          />
          <div className="flex-1 flex flex-wrap">
            <WhiteCards
              stage={stage}
              currentPlayer={currentPlayer}
              isMyTurn={isMyTurn}
              playerID={playerID}
              cardsOrder={selectedwhiteCardsOrder}
              cards={selectedWhiteCards}
              isSelectable={allWhiteCardsAreSelected}
              selectedWinnerID={chosenWinnerID}
              winnerPlayerID={winnerPlayerID}
              handleWinnerSelection={this.handleWinnerSelection}
              handleSelectedWinner={this.handleSelectedWinner}
            />
          </div>
        </div>
        <MyHand
          stage={stage}
          cards={hands[playerID]}
          isMyTurn={isMyTurn}
          onSelect={this.handleWhiteCardSelection}
          onSubmit={this.handleSelectedWhiteCard}
          selectedCard={chosenWhiteCard[playerID]}
          isSelectedCardSent={isSelectedWhiteCardSent}
        ></MyHand>
      </div>
    );
  }
}
