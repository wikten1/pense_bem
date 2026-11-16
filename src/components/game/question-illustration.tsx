import { Image } from 'expo-image';
import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Illustration, IllustrationId } from '@/content/aladdin-visuals';
import { SoundPressable } from '@/components/sound-pressable';
import { colors, space } from '@/theme/tokens';

const images: Record<IllustrationId, number> = {
  'money-bank': require('../../../assets/images/questions/aladdin/money-bank.png'),
  'time-objects': require('../../../assets/images/questions/aladdin/time-objects.png'),
  'money-wallet': require('../../../assets/images/questions/aladdin/money-wallet.png'),
  'wood-cutting': require('../../../assets/images/questions/aladdin/wood-cutting.png'),
  'temperature-tools': require('../../../assets/images/questions/aladdin/temperature-tools.png'),
  'liquid-measure': require('../../../assets/images/questions/aladdin/liquid-measure.png'),
  'length-tools': require('../../../assets/images/questions/aladdin/length-tools.png'),
  'person-scale': require('../../../assets/images/questions/aladdin/person-scale.png'),
  'food-scale': require('../../../assets/images/questions/aladdin/food-scale.png'),
  'mysterious-cave': require('../../../assets/images/questions/aladdin/mysterious-cave.png'),
  grande: require('../../../assets/images/questions/aladdin/grande.png'),
  alegre: require('../../../assets/images/questions/aladdin/alegre.png'),
  sujo: require('../../../assets/images/questions/aladdin/sujo.png'),
  doce: require('../../../assets/images/questions/aladdin/doce.png'),
  curva: require('../../../assets/images/questions/aladdin/curva.png'),
  noite: require('../../../assets/images/questions/aladdin/noite.png'),
  fechado: require('../../../assets/images/questions/aladdin/fechado.png'),
  gordo: require('../../../assets/images/questions/aladdin/gordo.png'),
  palace: require('../../../assets/images/questions/aladdin/palace.webp'),
  'tiger-lunch': require('../../../assets/images/questions/aladdin/tiger-lunch.png'),
  'tiger-cubs': require('../../../assets/images/questions/aladdin/tiger-cubs.webp'),
  'tiger-calm': require('../../../assets/images/questions/aladdin/tiger-calm.webp'),
  'tiger-attack': require('../../../assets/images/questions/aladdin/tiger-attack.webp'),
  characters: require('../../../assets/images/questions/aladdin/characters.webp'),
  instruments: require('../../../assets/images/questions/aladdin/instruments.webp'),
  desert: require('../../../assets/images/questions/aladdin/desert.webp'),
  'al-vegetables': require('../../../assets/images/questions/aladdin/al-vegetables.png'),
  'al-safety-pin': require('../../../assets/images/questions/aladdin/al-safety-pin.png'),
  'al-cushion': require('../../../assets/images/questions/aladdin/al-cushion.png'),
  'al-pliers': require('../../../assets/images/questions/aladdin/al-pliers.png'),
  'al-artichoke': require('../../../assets/images/questions/aladdin/al-artichoke.png'),
  'al-cotton': require('../../../assets/images/questions/aladdin/al-cotton.png'),
  'al-alcohol': require('../../../assets/images/questions/aladdin/al-alcohol.png'),
  'sinbad-boats': require('../../../assets/images/questions/aladdin/sinbad-boats.png'),
  'arabian-headwear': require('../../../assets/images/questions/aladdin/arabian-headwear.png'),
  'arabian-footwear': require('../../../assets/images/questions/aladdin/arabian-footwear.png'),
  'arabian-vest': require('../../../assets/images/questions/aladdin/arabian-vest.png'),
  'arabian-trousers': require('../../../assets/images/questions/aladdin/arabian-trousers.png'),
  'aladdin-lamp': require('../../../assets/images/questions/aladdin/aladdin-lamp.png'),
  'ancient-objects': require('../../../assets/images/questions/aladdin/ancient-objects.png'),
  crossword: require('../../../assets/images/questions/aladdin/crossword.png'),
  bay: require('../../../assets/images/questions/aladdin/bay.webp'),
  island: require('../../../assets/images/questions/aladdin/island.webp'),
  reef: require('../../../assets/images/questions/aladdin/reef.webp'),
  cape: require('../../../assets/images/questions/aladdin/cape.webp'),
  mermaid: require('../../../assets/images/questions/aladdin/mermaid.webp'),
  centaur: require('../../../assets/images/questions/aladdin/centaur.webp'),
  curupira: require('../../../assets/images/questions/aladdin/curupira.webp'),
  dragon: require('../../../assets/images/questions/aladdin/dragon.webp'),
  unicorn: require('../../../assets/images/questions/aladdin/unicorn.webp'),
  werewolf: require('../../../assets/images/questions/aladdin/werewolf.webp'),
  puzzle: require('../../../assets/images/questions/aladdin/puzzle.webp'),
  sherazade: require('../../../assets/images/questions/aladdin/sherazade-options.png'),
  'ali-baba-sequence': require('../../../assets/images/questions/aladdin/ali-baba-sequence.webp'),
  cinema: require('../../../assets/images/questions/aladdin/cinema.png'),
  filmmaking: require('../../../assets/images/questions/aladdin/filmmaking.png'),
  'genie-sequence': require('../../../assets/images/questions/aladdin/genie-sequence.png'),
  orchestra: require('../../../assets/images/questions/aladdin/orchestra.webp'),
  'home-video': require('../../../assets/images/questions/aladdin/home-video.png'),
};

export function QuestionIllustration({ illustration }: { illustration: Illustration }) {
  const [expanded, setExpanded] = useState(false);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const aspectRatio = illustration.width / illustration.height;
  const expandedWidth = Math.max(width, illustration.width);
  const source = images[illustration.id];

  return (
    <View style={styles.container}>
      <SoundPressable
        accessibilityRole="button"
        accessibilityLabel={`Ampliar ilustração. ${illustration.description}`}
        accessibilityHint="Abre a imagem maior para examinar os detalhes."
        onPress={() => setExpanded(true)}>
        <Image source={source} style={[styles.image, { aspectRatio }]} contentFit="contain" />
        <Text style={styles.caption}>Toque para ampliar a ilustração</Text>
      </SoundPressable>
      <Modal visible={expanded} animationType="fade" onRequestClose={() => setExpanded(false)}>
        <View style={[styles.modal, { paddingTop: insets.top + space.md, paddingBottom: insets.bottom + space.md }]} accessibilityViewIsModal>
          <SoundPressable sound="back" accessibilityRole="button" onPress={() => setExpanded(false)} style={styles.close}>
            <Text style={styles.closeText}>Fechar ilustração</Text>
          </SoundPressable>
          <Text style={styles.instructions}>Arraste para ver os detalhes da imagem.</Text>
          <ScrollView style={styles.viewer}>
            <ScrollView horizontal>
              <Image
                source={source}
                accessibilityLabel={illustration.description}
                style={{ width: expandedWidth, height: expandedWidth / aspectRatio }}
                contentFit="contain"
              />
            </ScrollView>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: space.sm },
  image: { width: '100%', borderRadius: 12, backgroundColor: '#fff' },
  caption: { color: colors.goldLight, fontSize: 13, paddingVertical: space.sm, textAlign: 'center' },
  modal: { flex: 1, backgroundColor: colors.background },
  close: { padding: space.md, minHeight: 48, alignSelf: 'flex-end' },
  closeText: { color: colors.goldLight, fontSize: 16 },
  instructions: { color: colors.text, fontSize: 14, padding: space.md },
  viewer: { flex: 1 },
});
