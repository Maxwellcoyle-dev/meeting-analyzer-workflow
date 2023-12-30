import {
  GetItemCommand,
  PutItemCommand,
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";

const REGION = "us-east-2";
const ddbClient = new DynamoDBClient({ region: REGION });
const tableName = process.env.DYNAMODB_TABLE_NAME;

const isDuplicateEvent = async (eventId) => {
  const params = {
    TableName: tableName,
    Key: {
      eventId: { S: eventId },
    },
  };
  const result = await ddbClient.send(new GetItemCommand(params));

  return result.Item != null;
};

const recordEvent = async (eventId) => {
  const params = {
    TableName: tableName,
    Item: {
      eventId: { S: eventId },
    },
  };
  try {
    await ddbClient.send(new PutItemCommand(params));
  } catch (err) {
    console.error(err);
  }
};

export const duplicateEventCheck = async (eventId) => {
  try {
    if (await isDuplicateEvent(eventId)) {
      console.log("Duplicate event detected, ignoring");
      return true;
    }
    console.log("New event detected, recording");
    await recordEvent(eventId);
    return false;
  } catch (err) {
    console.error("Error checking event id", err);
  }
};
