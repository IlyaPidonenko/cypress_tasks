import hh from "hyperscript-helpers";
import { h, diff, patch } from "virtual-dom";
import createElement from "virtual-dom/create-element";

const { div, button, p, h1, input } = hh(h);

const btnStyle = "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded";

const MSGS = {
  ADD_CARD: "ADD_CARD",
  DELETE_CARD: "DELETE_CARD",
  TOGGLE_ANSWER: "TOGGLE_ANSWER",
  RATE_CARD: "RATE_CARD",
  EDIT_CARD: "EDIT_CARD",
};

function view(dispatch, model) {
  return div({ className: "flex flex-col gap-4 items-center" }, [
    h1({ className: "text-2xl" }, "Karteikartenspiel"),

    div({ className: "flex gap-4" }, [
      input({
        type: "question",
        className: "border rounded py-2 px-3",
        placeholder: "Frage",
        value: model.questionInputValue,
        oninput: (event) => {
          model.questionInputValue = event.target.value;
        },
      }),
      input({
        type: "answer",
        placeholder: "Antwort",
        className: "border rounded py-2 px-3",
        value: model.answerInputValue,
        oninput: (event) => {
          model.answerInputValue = event.target.value;
        },
      }),
      button({ type: "save", className: btnStyle, onclick: () => dispatch({ type: MSGS.ADD_CARD }) }, "Hinzufügen"),
    ]),

    div({ className: "flex flex-wrap w-full" }, model.cards.map((card, index) =>
      div({ className: "w-1/3 p-4 border" }, [
        button({ type: "edit", className: "text-blue-500 float-left", onclick: () => dispatch({ type: MSGS.EDIT_CARD, index }) }, "Bearbeiten"), // Bearbeiten-Button hinzugefügt
        button({ type: "delete", className: "text-red-500 float-right", onclick: () => dispatch({ type: MSGS.DELETE_CARD, index }) }, "Löschen"),
        div({ className: "clear-both" }),
        p({ className: "bg-blue-100 p-2" }, "Frage: " + card.question),
        button({ type: "show",
          onclick: () => dispatch({ type: MSGS.TOGGLE_ANSWER, index }),
        }, card.showAnswer ? "Antwort ausblenden" : "Antwort einblenden"),
        card.showAnswer ? p({ className: "bg-blue-100 p-2" }, "Antwort: " + card.answer) : null,
        card.showAnswer ? div({ className: "mt-2" }, [
          button({ className: "text-red-500", onclick: () => dispatch({ type: MSGS.RATE_CARD, index, rating: -1 }) }, "Schlecht"),
          button({ className: "text-blue-500 ml-2", onclick: () => dispatch({ type: MSGS.RATE_CARD, index, rating: 1 }) }, "Gut"),
          button({ className: "text-green-500 ml-2", onclick: () => dispatch({ type: MSGS.RATE_CARD, index, rating: 2 }) }, "Perfekt"),
        ]) : null,
      ])
    )),
  ]);
}

function update(msg, model) {
  switch (msg.type) {
    case MSGS.ADD_CARD:
      if (model.questionInputValue && model.answerInputValue) {
        const newCard = {
          question: model.questionInputValue,
          answer: model.answerInputValue,
          showAnswer: false,
          rating: 0,
        };
        return {
          ...model,
          questionInputValue: "",
          answerInputValue: "",
          cards: [...model.cards, newCard].sort((a, b) => a.rating - b.rating),
        };
      }
      return model;

    case MSGS.DELETE_CARD:
      const updatedCards = [...model.cards];
      updatedCards.splice(msg.index, 1);
      return { ...model, cards: updatedCards };

    case MSGS.TOGGLE_ANSWER:
      const toggledCards = [...model.cards];
      toggledCards[msg.index].showAnswer = !toggledCards[msg.index].showAnswer;
      return { ...model, cards: toggledCards };

    case MSGS.RATE_CARD:
      const ratedCards = [...model.cards];
      if (msg.rating === -1) {
        ratedCards[msg.index].rating -= 1
        if (ratedCards[msg.index].rating < 0) {
          ratedCards[msg.index].rating = 0;
        }
      } else {
        ratedCards[msg.index].rating += msg.rating;

      }
      return {
        ...model,
        cards: ratedCards.sort((a, b) => a.rating - b.rating),
      };

    case MSGS.EDIT_CARD:
      const editedCard = { ...model.cards[msg.index] };
      const newQuestion = prompt("Neue Frage:", editedCard.question);
      if (newQuestion !== null) {
        const newAnswer = prompt("Neue Antwort:", editedCard.answer);
        if (newAnswer !== null) {
          editedCard.question = newQuestion;
          editedCard.answer = newAnswer;
          const editedCards = [...model.cards];
          editedCards[msg.index] = editedCard;
          return { ...model, cards: editedCards };
        }
      }
      return model;

    default:
      return model;
  }
}

function app(initModel, update, view, node) {
  let model = initModel;
  let currentView = view(dispatch, model);
  let rootNode = createElement(currentView);
  node.appendChild(rootNode);
  function dispatch(msg) {
    model = update(msg, model);
    const updatedView = view(dispatch, model);
    const patches = diff(currentView, updatedView);
    rootNode = patch(rootNode, patches);
    currentView = updatedView;
  }
}

const initModel = {
  questionInputValue: "",
  answerInputValue: "",
  cards: [],
};

const rootNode = document.getElementById("app");
app(initModel, update, view, rootNode);