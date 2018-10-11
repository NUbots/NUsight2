#!/bin/sh
echo "Moving jsons into the right folders"
cp ~/IGusModelStuffs/jsons/*.json ./
mv torso.json body/config/torso.json
mv head.json head/config/head.json
cp left_shoulder.json right_arm/config/right_shoulder.json
cp lower_left_arm.json right_arm/config/lower_right_arm.json
cp upper_left_arm.json right_arm/config/upper_right_arm.json
mv left_shoulder.json *arm.json left_arm/config/
cp left_foot.json right_leg/config/right_foot.json
cp left_hip.json right_leg/config/right_hip.json
cp lower_left_leg.json right_leg/config/lower_right_leg.json
cp upper_left_leg.json right_leg/config/upper_right_leg.json
mv *.json left_leg/config
echo "Finished moving them into their respective configs"
