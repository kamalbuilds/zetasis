// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@zetachain/protocol-contracts/contracts/evm/interfaces/ZetaInterfaces.sol";
import "@zetachain/protocol-contracts/contracts/evm/tools/ZetaInteractor.sol";

interface NewNFTErrors {
    error InvalidMessageType();

    error InvalidTransferCaller();

    error ErrorApprovingZeta();
}

contract NewNFT is ERC721, ZetaInteractor, ZetaReceiver, NewNFTErrors {
    using Counters for Counters.Counter;
    using Strings for uint256;

    bytes32 public constant CROSS_CHAIN_TRANSFER_MESSAGE =
        keccak256("CROSS_CHAIN_TRANSFER");

    IERC20 internal immutable _zetaToken;

    string public baseURI;

    string private collectionURI;

    mapping(uint256 => string) private _tokenURIs;

    Counters.Counter public tokenIds;

    ZetaTokenConsumer private immutable _zetaConsumer;

    uint256 public immutable MAX_TOTAL_SUPPLY;

    // Events
    event Mint(address indexed minter);

    event SetBaseURI(string indexed uri);

    event SetCollectionURI(string indexed uri);

    // Constructor
    constructor(
        address connectorAddress,
        address zetaTokenAddress,
        address zetaConsumerAddress,
        bool useEven,
        string memory _name,
        string memory _symbol,
        string memory _baseURI,
        string memory _collectionURI,
        uint256 _tokenSupply
    ) ERC721(_name, _symbol) ZetaInteractor(connectorAddress) {
        _zetaToken = IERC20(zetaTokenAddress);
        _zetaConsumer = ZetaTokenConsumer(zetaConsumerAddress);
        MAX_TOTAL_SUPPLY = _tokenSupply;
        collectionURI = _collectionURI;
        baseURI = _baseURI;
    }

    // Function to mint a new token
    function mint() external {
        uint256 tokenId = nextTokenId();
        _safeMint(msg.sender, tokenId);

        emit Mint(msg.sender);
    }

    // Function to set the URI of a token
    function setTokenURI(uint256 tokenId, string memory _tokenURI) internal {
        _tokenURIs[tokenId] = _tokenURI;
    }

    // Function to get the URI of a token
    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        if (bytes(_tokenURIs[tokenId]).length != 0) {
            return _tokenURIs[tokenId];
        } else {
            return string(abi.encodePacked(baseURI, tokenId.toString()));
        }
    }

    // Function to set the contract's collection URI
    function setCollectionURI(string memory _collectionURI) external onlyOwner {
        collectionURI = _collectionURI;

        emit SetCollectionURI(_collectionURI);
    }

    // Function to get the contract's collection URI
    function contractURI() public view returns (string memory) {
        return collectionURI;
    }

    // Function to set the base URI of the contract
    function setBaseURI(string memory newbaseURI) external onlyOwner {
        baseURI = newbaseURI;

        emit SetBaseURI(newbaseURI);
    }

    // Function to get the base URI of the contract
    function getBaseURI() external view returns (string memory) {
        return baseURI;
    }

    // Internal function to burn a token with a given ID
    function _burnToken(uint256 burnedTokenId) internal {
        _burn(burnedTokenId);
    }

    // Function to get the next available token ID
    function nextTokenId() private returns (uint256) {
        tokenIds.increment();
        return tokenIds.current();
    }

    // Function to get the last token ID minted
    function getLastTokenId() external view returns (uint256) {
        return tokenIds.current();
    }

    // Function for cross-chain transfer of a token
    function crossChainTransfer(
        uint256 crossChainId,
        address to,
        uint256 tokenId
    ) external payable {
        if (!_isValidChainId(crossChainId)) revert InvalidDestinationChainId();
        if (!_isApprovedOrOwner(_msgSender(), tokenId))
            revert InvalidTransferCaller();

        uint256 crossChainGas = 18 * (10 ** 18);
        uint256 zetaValueAndGas = _zetaConsumer.getZetaFromEth{
            value: msg.value
        }(address(this), crossChainGas);
        _zetaToken.approve(address(connector), zetaValueAndGas);

        _burnToken(tokenId);

        connector.send(
            ZetaInterfaces.SendInput({
                destinationChainId: crossChainId,
                destinationAddress: interactorsByChainId[crossChainId],
                destinationGasLimit: 500000,
                message: abi.encode(
                    CROSS_CHAIN_TRANSFER_MESSAGE,
                    tokenId,
                    msg.sender,
                    to
                ),
                zetaValueAndGas: zetaValueAndGas,
                zetaParams: abi.encode("")
            })
        );
    }

    // Function to enable cross-chain minting
    function _mintId(address to, uint256 tokenId) internal {
        _safeMint(to, tokenId);
        string memory uri = tokenURI(tokenId);
        if (bytes(uri).length > 0) {
            setTokenURI(tokenId, uri);
        }
    }

    // Function to handle messages from Zeta protocol
    function onZetaMessage(
        ZetaInterfaces.ZetaMessage calldata zetaMessage
    ) external override isValidMessageCall(zetaMessage) {
        (
            bytes32 messageType,
            uint256 tokenId,
            ,
            /**
             * @dev this extra comma corresponds to address from
             */
            address to
        ) = abi.decode(
                zetaMessage.message,
                (bytes32, uint256, address, address)
            );

        if (messageType != CROSS_CHAIN_TRANSFER_MESSAGE)
            revert InvalidMessageType();

        _mintId(to, tokenId);
    }

    // Function to handle reverts from Zeta protocol
    function onZetaRevert(
        ZetaInterfaces.ZetaRevert calldata zetaRevert
    ) external override isValidRevertCall(zetaRevert) {
        (bytes32 messageType, uint256 tokenId, address from) = abi.decode(
            zetaRevert.message,
            (bytes32, uint256, address)
        );

        if (messageType != CROSS_CHAIN_TRANSFER_MESSAGE)
            revert InvalidMessageType();

        _mintId(from, tokenId);
    }
}
