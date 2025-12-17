import { db } from "../../config/mongoConfig";

export async function getProjectToolsInfo(token: string, project: string) {
  const collection = db.collection("mmosh-app-project-tools");

  const data = await collection.findOne({
    type: "telegram",
    "data.botToken": token,
    "project": project
  });

  return data;
}


export async function updateProjectGroupId(token: string,project: string,groupId: number, groupTitle: string | undefined) {
    const collection = db.collection("mmosh-app-project-tools");

    const data = await collection.updateOne({
        'project': project,
        'data.botToken': token,
        'groups.groupLink': groupTitle
    }, {
        $set: {'groups.$.groupId': groupId}
    });

    return data;
}

export async function getAllTelegramAgents() {
  const collection = db.collection("mmosh-app-project-tools");

  const data = await collection.find({
      'type': 'telegram'
  }).toArray();

  return data;
}