import { Client, Databases, ID, Query } from 'react-native-appwrite';

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)
  .setPlatform('com.akhin.reelsorganizer');

const databases = new Databases(client);

export { databases, ID, Query };
