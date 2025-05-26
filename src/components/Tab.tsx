import { useContext, useState } from "react";
import { Welcome } from "./sample/Welcome";
import { TeamsFxContext } from "./Context";
import AudioCapture from "./sample/AudioCapture";
import { Button, makeStyles, tokens } from "@fluentui/react-components";
import config from "./sample/lib/config";

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: tokens.spacingHorizontalM
  }
});

const showFunction = Boolean(config.apiName);

export default function Tab() {
  const styles = useStyles();
  const { themeString } = useContext(TeamsFxContext);
  const [showAudioCapture, setShowAudioCapture] = useState(false);

  return (
    <div
      className={themeString === "default" ? "light" : themeString === "dark" ? "dark" : "contrast"}
    >
      <div className={styles.container}>
        <Welcome showFunction={showFunction} />
        
        <div className={styles.buttonContainer}>
          <Button 
            appearance="primary" 
            onClick={() => setShowAudioCapture(!showAudioCapture)}
          >
            {showAudioCapture ? "音声キャプチャを閉じる" : "音声キャプチャを開く"}
          </Button>
        </div>

        {showAudioCapture && <AudioCapture />}
      </div>
    </div>
  );
}
