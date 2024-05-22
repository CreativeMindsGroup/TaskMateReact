export const DataApi = [
  {
    lanes: [
      {
        id: "PLANNED",
        title: "Planned Tasks",
        label: "20/70",
        style: { width: "280px" },
        cards: [
          {
            id: "Milk",
            title: "Buy milk",
            label: "15 mins",
            cardStyle: {
              width: 270,
              maxWidth: 270,
              margin: "auto",
              marginBottom: 5,
            },
            description: "2 Gallons of milk at the Deli store",
          },
          {
            id: "Plan4",
            title: "Pay Rent",
            label: "5 mins",
            cardStyle: {
              width: 270,
              maxWidth: 270,
              margin: "auto",
              marginBottom: 5,
            },
            description: "Transfer to bank account",
          },
        ],
      },
      {
        id: "WIP",
        title: "Work In Progress",
        label: "10/20",
        style: { width: "280px" },
        cards: [
          {
            id: "Wip1",
            title: "Clean House",
            label: "30 mins",
            cardStyle: {
              width: 270,
              maxWidth: 270,
              margin: "auto",
              marginBottom: 5,
            },
            description:
              "Soap wash and polish floor. Polish windows and doors. Scrap all broken glasses",
          },
        ],
      },
      {
        id: "BLOCKED",
        title: "Blocked",
        label: "0/0",
        style: { width: 280 },
        cards: [],
      },
    ],
  },
];

export const transformBoardData = (apiData) => {
  if (!apiData || !apiData.length || !apiData[0].getCardListDtos) {
    return { lanes: [] };
  }

  const lanes = apiData[0].getCardListDtos.map((cardListDto) => ({
    id: cardListDto.id,
    title: cardListDto.title,
    boardsId: cardListDto.boardsId,
    style: { width: "280px" },
    cards: cardListDto.getCardDtos.map((cardDto) => ({
      id: cardDto.id,
      title: cardDto.title,
      description: cardDto.description || "",
      startDate: cardDto.startDate || "",
      endDate: cardDto.endDate || "",
      cardListId: cardDto.cardListId || "",
      cardStyle: { width: 270, maxWidth: 270, margin: "auto", marginBottom: 5 },
    })),
    // lane'e özel stil eklemek gerekiyorsa burada yapılabilir
  }));

  return { lanes };
};
