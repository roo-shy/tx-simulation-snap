import VM from '@ethereumjs/vm';
import { decodeSingle } from '@metamask/abi-utils';
import { addHexPrefix, Address } from 'ethereumjs-util';

const getTokenSymbol = async (vm: VM, address: string) => {
  const payload = {
    to: Address.fromString(address),
    caller: Address.zero(),
    data: Buffer.from('95d89b41', 'hex'),
  };
  const result = await vm.runCall(payload);
  const hexResult = addHexPrefix(
    result.execResult.returnValue.toString('hex'),
  ) as `0x${string}`;
  const decoded = decodeSingle('string', hexResult);
  return decoded;
};

const getTokenDecimals = async (vm: VM, address: string) => {
  const payload = {
    to: Address.fromString(address),
    caller: Address.zero(),
    data: Buffer.from('313ce567', 'hex'),
  };
  const result = await vm.runCall(payload);
  const hexResult = addHexPrefix(
    result.execResult.returnValue.toString('hex'),
  ) as `0x${string}`;
  const decoded = addHexPrefix(decodeSingle('uint8', hexResult).toString(16));
  return decoded;
};

export const decodeERC20Transfers = async (vm: VM, logs: any) => {
  try {
    return await Promise.all(
      logs
        .filter(
          (log) =>
            log.decoded?.name === 'Transfer' ||
            log.topics[0] ===
              '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        )
        .map(async (log) => {
          const from = decodeSingle('address', log.topics[1]);
          const to = decodeSingle('address', log.topics[2]);
          const value = decodeSingle('uint256', log.data).toString(10);
          const symbol = await getTokenSymbol(vm, log.address);
          const decimals = await getTokenDecimals(vm, log.address);
          return { from, to, value, symbol, decimals };
        }),
    );
  } catch {
    return [];
  }
};
