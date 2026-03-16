// Transform registry — maps config function names to implementations
import searchPerson from './searchPerson';
import searchTransactions from './searchTransactions';
import { emailLookup, nameLookup, usernameLookup, phoneLookup } from './osintLookup';

const registry = {
  searchPerson,
  searchTransactions,
  emailLookup,
  nameLookup,
  usernameLookup,
  phoneLookup,
};

export async function runTransform(functionName, attributes) {
  const fn = registry[functionName];
  if (!fn) return [];
  return fn(attributes);
}
