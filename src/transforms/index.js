/**
 * Transform registry — maps functionName strings to actual functions.
 * This keeps the transform config (JSON) fully decoupled from implementation.
 */
import searchPerson from './searchPerson';
import searchTransactions from './searchTransactions';

const registry = {
  searchPerson,
  searchTransactions,
};

/**
 * Run a transform by its functionName.
 * @param {string} functionName
 * @param {object} attributes — source entity attributes
 * @returns {Promise<object[]>} array of result records
 */
export async function runTransform(functionName, attributes) {
  const fn = registry[functionName];
  if (!fn) {
    console.error(`[transforms] Unknown function: ${functionName}`);
    return [];
  }
  return fn(attributes);
}
