const data = [
  42,
  "alexanderThomas",
  {
    vehicle: "sedan",
    animal: "elephant",
    ecosystem: {
      sound: "rustling",
      primaryResource: "water",
      biodiversityResearch: [
        {
          researcher: "DrEmilyRamirez",
          observation: "migratorySurvey",
        },
        "conservationData",
      ],
    },
  },
  ["riverValley", "mountainRange", "desertPlain", "coastalRegion"],
];

const customSerializer = (data) => {
  // Implement the custom serializer here
  let result;
  if (typeof data === "number") {
    result = `num:${data}`;
  } else if (typeof data === "string") {
    result = "str:";
    if (data.length > 2)
      result += `${data[0]}${data.length - 2}${data[data.length - 1]}`;
    else result += data;
  } else if (Array.isArray(data)) {
    result = "arr:";
    data.forEach((d) => {
      result += customSerializer(d);
    });
  } else if (typeof data === "object" && typeof data !== null) {
    result = "obj:";
    Object.values(data).forEach((value) => {
      result += customSerializer(value);
    });
  } else {
    result = "err:unknown";
  }

  return result;
};

const encodedData = customSerializer(data);
console.log(encodedData);
