import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const {
      MONGODB_URI,
      MONGODB_USER,
      MONGODB_PASS,
      MONGODB_HOST,
      MONGODB_DB,
      MONGODB_APPNAME
    } = process.env;

    const appName = MONGODB_APPNAME || "Cluster0";

    // Prefer full URI if provided; otherwise build from parts
    const uri = MONGODB_URI && MONGODB_URI.trim().length > 0
      ? MONGODB_URI
      : (MONGODB_USER && MONGODB_PASS && MONGODB_HOST
        ? `mongodb+srv://${encodeURIComponent(MONGODB_USER)}:${encodeURIComponent(MONGODB_PASS)}@${MONGODB_HOST}/${MONGODB_DB || "test"}?retryWrites=true&w=majority&appName=${encodeURIComponent(appName)}`
        : undefined);

    if (!uri) {
      throw new Error("MongoDB configuration missing. Set MONGODB_URI or MONGODB_USER/MONGODB_PASS/MONGODB_HOST.");
    }

    const conn = await mongoose.connect(uri, {
      dbName: MONGODB_DB || undefined,
      serverSelectionTimeoutMS: 10000
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
