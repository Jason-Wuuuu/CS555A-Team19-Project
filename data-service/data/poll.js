import { polls } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";

/**
 * @param {String} org_id
 * @param {String} event_id
 * @param {String} title
 * @param {String} description
 * @param {Array} options
 */
const create = async (org_id, event_id, title, description, options) => {
  // validation

  const optionsObj = {};
  options.forEach((option) => (optionsObj[option] = []));

  // create new poll
  const newPoll = {
    _id: new ObjectId(),
    org_id: org_id,
    event_id: event_id,
    title: title,
    description: description,
    options: optionsObj,
  };

  // add to database
  const pollCollection = await polls();
  const insertInfo = await pollCollection.insertOne(newPoll);
  if (!insertInfo.acknowledged || !insertInfo.insertedId)
    throw "Error: Could not add poll.";

  // get from database
  const newId = insertInfo.insertedId.toString();
  return await get(newId);
};

/**
 *
 * @param {String} poll_id
 */
const get = async (poll_id) => {
  // validation

  // get from database
  const pollCollection = await polls();
  const poll = await pollCollection.findOne({
    _id: new ObjectId(poll_id),
  });
  if (!poll) throw `Error: no poll exists with an id of ${poll_id}.`;
  poll._id = poll._id.toString();

  return poll;
};

const getAll = async () => {
  const pollCollection = await polls();
  let pollList = await pollCollection.find({}).toArray();
  if (!pollList) throw "Error: Could not get all polls.";
  pollList = pollList.map((poll) => {
    poll._id = poll._id.toString();
    return poll;
  });

  return pollList;
};

/**
 *
 * @param {String} event_id
 */
const getByEventId = async (event_id) => {
  const pollsData = await polls();
  const pollList = await pollsData.findAll({ _id: event_id });
  return pollList;
};

/**
 *
 * @param {String} user_id
 * @param {String} poll_id
 * @param {String} option
 */
const vote = async (user_id, poll_id, option) => {
  // validation

  const pollCollection = await polls();

  let pushObj = {};
  pushObj["options." + option] = user_id;

  let poll = await pollCollection.updateOne(
    { _id: new ObjectId(poll_id) },
    {
      $push: pushObj,
    }
  );

  if (!poll) throw `Could not update the recipe with id ${poll_id}`;

  return await get(poll_id);
};

/**
 * @param {String} org_id
 * @param {String} event_id
 * @param {String} title
 * @param {String} description
 * @param {Array} options
 */
const update = async (_org_id, _poll_id, _title, _description, _options) => {
  const pollsData = await polls();
  const poll = await pollsData.findOne({
    poll_id: _poll_id,
    org_id: _org_id,
  });
  
  let { title, description, options } = poll;
  _title = _title ? _title : title;
  _description = _description ? _description : description;
  _options = _options ? _options : options;

  const updateInfo = await pollsData.findOneAndUpdate(
    { poll_id: _poll_id, org_id: _org_id },
    {
      $set: {
        title: _title,
        description: _description,
        options: _options,
      },
    },
    { returnDocument: "after" }
  );
  return updateInfo;
};

/**
 *
 * @param {String} user_id
 * @param {String} poll_id
 * @param {String} option
 */
const remove = async (user_id, poll_id) => {
  const pollsData = await polls();
  const poll = await pollsData.findOne({ poll_id: new ObjectId(poll_id) });
  let options = poll.options;
  for (let k of Object.keys(options)) {
    options[k].filter((ele) => {
      return ele !== user_id;
    });
  }
  const updateInfo = await pollsData.findOneAndUpdate(
    { poll_id: new ObjectId(poll_id) },
    { options }
  );
  return updateInfo;
};

// try {
//   const poll = await create("123", "456", "poll1", "des", ["opt1", "opt2"]);
//   await getAll();
// } catch (error) {
//   console.log(error);
// }

export { create, get, getAll, getByEventId, vote, update, remove };
