const { Contact } = require("../models/contact");
const { HttpError, ctrlWrapper } = require("../helpers");

const getAll = async (req, res, next) => {
  const { _id: owner } = req.user;
  const { page = 1, limit = 25, favorite } = req.query;
  const searchParams = favorite === undefined ? { owner } : { owner, favorite };
  const skip = (page - 1) * limit;
  const contactsList = await Contact.find(searchParams, null, {
    skip,
    limit,
  }).populate("owner", "email subscription");
  res.json(contactsList);
};

const getById = async (req, res, next) => {
  const { _id: owner } = req.user;
  const contact = await Contact.findOne({ _id: req.params.id, owner });
  if (!contact) throw HttpError(404, "Not found");
  res.json(contact);
};

const add = async (req, res, next) => {
  const { _id: owner } = req.user;
  const newContact = await Contact.create({ ...req.body, owner });
  res.status(201).json(newContact);
};

const updateById = async (req, res, next) => {
  if (Object.keys(req.body).length === 0)
    throw HttpError(400, "missing fields");
  const { _id: owner } = req.user;
  const contact = await Contact.findOneAndUpdate(
    { _id: req.params.id, owner },
    req.body,
    {
      new: true,
    }
  )
    .where("owner")
    .equals(req.user._id);
  if (!contact) throw HttpError(404, "Not found");
  res.json(contact);
};

const updateStatusContact = async (req, res, next) => {
  if (Object.keys(req.body).length === 0)
    throw HttpError(400, "missing field favorite");
  const { _id: owner } = req.user;
  const contact = await Contact.findOneAndUpdate(
    { _id: req.params.id, owner },
    req.body,
    {
      new: true,
    }
  )
    .where("owner")
    .equals(req.user._id);
  if (!contact) throw HttpError(404, "Not found");
  res.json(contact);
};

const deleteById = async (req, res, next) => {
  const { _id: owner } = req.user;
  const contact = await Contact.findOneAndRemove({ _id: req.params.id, owner })
    .where("owner")
    .equals(req.user._id);
  if (!contact) throw HttpError(404, "Not found");
  res.json({ message: "contact deleted" });
};

module.exports = {
  getAll: ctrlWrapper(getAll),
  getById: ctrlWrapper(getById),
  add: ctrlWrapper(add),
  updateById: ctrlWrapper(updateById),
  updateStatusContact: ctrlWrapper(updateStatusContact),
  deleteById: ctrlWrapper(deleteById),
};