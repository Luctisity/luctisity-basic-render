import manTexture   from "../../assets/textures/man.jpg";
import trollTexture from "../../assets/textures/troll.png";

import quandaleSound from "../../assets/sounds/quandale.mp3";
import fartSound     from "../../assets/sounds/fart.mp3";

export type AssetAtlas = {
    textures: { [key: string]: any },
    sounds:   { [key: string]: any }
}

const assetAtlas: AssetAtlas = {
    textures: {
        man:   manTexture,
        troll: trollTexture
    },
    sounds: {
        quandale:  quandaleSound,
        fart: fartSound
    }
}

export default assetAtlas;