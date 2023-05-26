import { CallData, shortString } from "starknet";
import { KeyPair, declareContract, expectEvent, expectRevertWithErrorMessage } from "./lib";
import { deployMultisig } from "./lib/multisig";

describe("ArgentMultisig", function () {
  let multisigAccountClassHash: string;

  before(async () => {
    multisigAccountClassHash = await declareContract("ArgentMultisig");
  });

  it("Should deploy multisig contract", async function () {
    const threshold = 1;
    const signersLength = 2;

    const { accountContract, signers, receipt } = await deployMultisig(
      multisigAccountClassHash,
      threshold,
      signersLength,
    );

    await expectEvent(receipt, {
      from_address: accountContract.address,
      keys: ["ConfigurationUpdated"],
      data: CallData.compile([threshold, signersLength, signers, []]),
    });

    await accountContract.get_threshold().should.eventually.equal(1n);
    await accountContract.get_signers().should.eventually.deep.equal(signers);
    await accountContract.get_name().should.eventually.equal(BigInt(shortString.encodeShortString("ArgentMultisig")));
    await accountContract.get_version().should.eventually.deep.equal({ major: 0n, minor: 1n, patch: 0n });

    await accountContract.is_signer(signers[0]).should.eventually.be.true;
    await accountContract.is_signer(signers[1]).should.eventually.be.true;
    await accountContract.is_signer(0).should.eventually.be.false;
    await accountContract.is_signer(new KeyPair().publicKey).should.eventually.be.false;

    await expectRevertWithErrorMessage("argent/non-null-caller", () => accountContract.__validate__([]));
  });

  it("Should fail to deploy with invalid signatures", async function () {
    const threshold = 1;
    const signersLength = 2;

    await expectRevertWithErrorMessage("argent/invalid-signature-length", async () => {
      const { receipt } = await deployMultisig(multisigAccountClassHash, threshold, signersLength, []);
      return receipt;
    });

    await expectRevertWithErrorMessage("argent/invalid-signature-length", async () => {
      const { receipt } = await deployMultisig(multisigAccountClassHash, threshold, signersLength, [0, 1]);
      return receipt;
    });
  });
});
