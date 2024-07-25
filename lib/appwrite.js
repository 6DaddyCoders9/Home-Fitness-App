import {
  Account,
  Client,
  ID,
  Avatars,
  Databases,
  Query,
  Storage,
} from "react-native-appwrite";

export const config = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.daddycoders.home_fitness",
  projectId: "669b6f1b003cb633b035",
  storageId: "669b6f80003053a28310",
  databaseId: "669b6fbe001201495ec0",
  userCollectionId: "669b6fce0007932debb1",
  body_partsCollectionId: "66a249c40018703562cb",
  exercisesCollectionId: "66a249cb000d5fcbbe1d",
  tipsCollectionId: "66a249d30010521f7138",
};

const client = new Client();
client
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setPlatform(config.platform);

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);

// User Management Functions

export async function createUser(email, password, username) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(username);

    await signIn(email, password);

    const newUser = await databases.createDocument(
      config.databaseId,
      config.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email: email,
        username: username,
        avatar: avatarUrl,
      }
    );

    return newUser;
  } catch (error) {
    throw new Error(error);
  }
}

export async function signIn(email, password) {
  try {
    const session = await account.createEmailPasswordSession(email, password);

    return session;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
}

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();

    if (!currentAccount) throw Error;

    const createUser = await databases.listDocuments(
      config.databaseId,
      config.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!createUser) throw Error;

    return createUser.documents[0];
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const signOut = async () => {
  try {
    const session = await account.deleteSession("current");

    return session;
  } catch (error) {
    throw new Error(error);
  }
};

// Data Fetching Functions

// Fetch all classes
export const getBodyParts = async () => {
  try {
    const body_parts = await databases.listDocuments(
      config.databaseId,
      config.body_partsCollectionId
    );
    return body_parts.documents;
  } catch (error) {
    console.error("Error fetching Body Parts:", error);
    throw new Error(error);
  }
};

// Fetch a class
export const getItemById = async (itemId) => {
  try {
    const response = await databases.getDocument(
      config.databaseId,
      config.body_partsCollectionId,
      itemId
    );
    return response;
  } catch (error) {
    console.error("Error fetching body parts by ID:", error);
    throw new Error(error);
  }
};

export const getExercisesByBodyParts = async (bodyPartId) => {
  try {
    // Fetch body part document by ID
    const bodyPart = await databases.getDocument(
      config.databaseId,
      config.body_partsCollectionId,
      bodyPartId
    );

    // Extract exercise IDs from the body part document
    const exerciseIds = bodyPart.exercise.map((exercise) => exercise.$id);

    // Fetch exercises documents by IDs
    const exercises = await Promise.all(
      exerciseIds.map((id) => {
        return databases.getDocument(
          config.databaseId,
          config.exercisesCollectionId,
          id
        );
      })
    );

    return exercises;
  } catch (error) {
    console.error("Error fetching exercises by body part:", error);
    throw new Error(error);
  }
};

export const getExercisesById = async (itemId) => {
  try {
    const response = await databases.getDocument(
      config.databaseId,
      config.exercisesCollectionId,
      itemId
    );
    return response;
  } catch (error) {
    console.error("Error fetching class by ID:", error);
    throw new Error(error);
  }
};

// Fetch study tips from Appwrite
export const getTips = async () => {
  try {
    const tips = await databases.listDocuments(
      config.databaseId,
      config.tipsCollectionId
    );
    return tips.documents;
  } catch (error) {
    console.error("Error fetching Workout Tips:", error);
    throw new Error(error);
  }
};
