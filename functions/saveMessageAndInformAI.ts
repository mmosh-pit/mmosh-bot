import { db } from "../config/mongoConfig";

export async function saveMessageAndInformAI(
  message: string,
  groupId: number,
  groupUsername: string,
  senderUsername: string,
  senderTelegramId: number,
) {
  const collection = db.collection("mmosh-app-project-tools");

  const existingData = await collection.findOne({
    "data.handle": groupUsername,
  });

  if (!existingData) return;

  await collection.updateOne(
    {
      _id: existingData!._id,
    },
    {
      $push: {
        messages: {
          senderUsername,
          senderTelegramId,
          message,
          createdAt: Date.now().toString(),
        },
      },
    },
  );

  // This is used to inform the AI
  // const formData = new FormData();
  //
  // const projectKey = existingData!.project;
  //
  // formData.append("name", projectKey);
  // formData.append("urls", "None");
  //
  // formData.append("text", message.replace("@", "").replace(groupUsername, ""));
  //
  // const metadata = groupId;
  //
  // formData.append("metadata", metadata);
  //
  // await fetch("https://mmoshapi-uodcouqmia-uc.a.run.app/upload", {
  //   body: formData,
  //   method: "POST",
  // });

  // This is used to save info and display it in the Inform section on the Web app
  // const data = {
  //   preview: message,
  //   name: "",
  //   type: "text",
  //   isPrivate: false,
  //   saved: true,
  //   id: `${groupId}-${new Date().getMilliseconds()}`,
  // };
  //
  // const mediaCollection = db.collection("mmosh-app-project-media");
  //
  // await mediaCollection.insertOne({
  //   media: data,
  //   projectkey: existingData!.project,
  //   created_date: new Date(),
  //   updated_date: new Date(),
  // });
}
