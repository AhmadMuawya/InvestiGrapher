// Finds accounts by national_id/phone, fetches transactions above threshold,
// and enriches each with sender/receiver details
import { BASE_URL, supabaseGet } from '../services/supabase';

const DEFAULT_THRESHOLD = 20_000_000;

const cache = { accounts: {}, persons: {}, banks: {} };

function clearCache() {
  cache.accounts = {};
  cache.persons = {};
  cache.banks = {};
}

async function getAccountsByField(field, value) {
  const url =
    `${BASE_URL}/accounts?select=id,account_number,account_type,balance,bank_id,person_id` +
    `&${field}=eq.${encodeURIComponent(value)}`;
  return supabaseGet(url);
}

async function getAccountById(accountId) {
  if (cache.accounts[accountId]) return cache.accounts[accountId];
  const url =
    `${BASE_URL}/accounts?select=id,account_number,account_type,balance,bank_id,person_id` +
    `&id=eq.${encodeURIComponent(accountId)}&limit=1`;
  const rows = await supabaseGet(url);
  const acc = rows[0] || null;
  cache.accounts[accountId] = acc;
  return acc;
}

async function getPersonById(personId) {
  if (cache.persons[personId]) return cache.persons[personId];
  const url =
    `${BASE_URL}/person?select=first_name,last_name,national_id,phone_number,date_of_birth` +
    `&id=eq.${encodeURIComponent(personId)}&limit=1`;
  const rows = await supabaseGet(url);
  const person = rows[0] || {};
  cache.persons[personId] = person;
  return person;
}

async function getBankName(bankId) {
  if (cache.banks[bankId]) return cache.banks[bankId];
  const url =
    `${BASE_URL}/banks?select=name&id=eq.${encodeURIComponent(bankId)}&limit=1`;
  const rows = await supabaseGet(url);
  const name = rows[0]?.name || '';
  cache.banks[bankId] = name;
  return name;
}

async function getTransactionsForAccount(accountId, threshold) {
  const url =
    `${BASE_URL}/transactions` +
    `?select=id,from_account,to_account,amount,reason,method,status,created_at,reference_number` +
    `&or=(from_account.eq.${encodeURIComponent(accountId)},to_account.eq.${encodeURIComponent(accountId)})` +
    `&amount=gt.${threshold}`;
  return supabaseGet(url);
}

async function buildPartyInfo(accountId, label) {
  const acc = await getAccountById(accountId);
  if (!acc) return {};
  const [person, bankName] = await Promise.all([
    getPersonById(acc.person_id || ''),
    getBankName(acc.bank_id || ''),
  ]);
  return {
    [`${label}_first_name`]: person.first_name || '',
    [`${label}_last_name`]: person.last_name || '',
    [`${label}_national_id`]: person.national_id || '',
    [`${label}_phone`]: person.phone_number || '',
    [`${label}_dob`]: person.date_of_birth || '',
    [`${label}_bank_name`]: bankName,
    [`${label}_account_number`]: acc.account_number || '',
    [`${label}_account_type`]: acc.account_type || '',
  };
}

async function formatTransactions(transactions) {
  return Promise.all(
    transactions.map(async (tx) => {
      const [sender, receiver] = await Promise.all([
        buildPartyInfo(tx.from_account, 'sender'),
        buildPartyInfo(tx.to_account, 'receiver'),
      ]);
      return {
        ...sender,
        ...receiver,
        reason: tx.reason || '',
        amount: tx.amount != null ? String(tx.amount) : '',
        method: tx.method || '',
        status: tx.status || '',
        created_at: tx.created_at || '',
        reference_number: tx.reference_number || '',
        transaction_id: tx.id || '',
      };
    }),
  );
}

export default async function searchTransactions(attributes) {
  clearCache();
  const threshold = DEFAULT_THRESHOLD;

  const nationalId = attributes.national_id || '';
  const phone = attributes.phone_number || '';

  // Prefer national_id, fallback to phone
  let accounts = [];
  if (nationalId) {
    accounts = await getAccountsByField('national_id', nationalId);
  }
  if (accounts.length === 0 && phone) {
    accounts = await getAccountsByField('phone_number', phone);
  }
  if (accounts.length === 0) return [];

  // Deduplicate transactions across all accounts
  const seenIds = new Set();
  const allTxs = [];
  const txBatches = await Promise.all(
    accounts.map((a) => getTransactionsForAccount(a.id, threshold)),
  );
  for (const batch of txBatches) {
    for (const tx of batch) {
      if (!seenIds.has(tx.id)) {
        seenIds.add(tx.id);
        allTxs.push(tx);
      }
    }
  }

  return formatTransactions(allTxs);
}
